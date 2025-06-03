import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  CircularProgress,
  Alert as MuiAlert,
  Box,
  Grid,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Snackbar,
  Chip,
  Divider,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import useApi from '../hooks/useApi';
import { api } from '../hooks/useApi';

// Custom Alert component for snackbar
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const { get, post, loading: apiLoading, error: apiError, setError } = useApi();
  
  const [dashboardData, setDashboardData] = useState({
    faculty: null,
    courses: [],
    students: [],
    grades: [],
    loading: true,
    error: null
  });

  const [expanded, setExpanded] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [gradeInputs, setGradeInputs] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    console.log('Fetching dashboard data...');
    
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch all faculty dashboard data in a single request
      const result = await get('/api/dashboard/faculty/');
      
      // Handle request cancellation
      if (result?.isCanceled) {
        console.log('Request was canceled');
        return;
      }
      
      // Handle API errors
      if (result?.error) {
        throw result.error;
      }
      
      const data = result?.data;
      console.log('Faculty Dashboard API Response:', data);
      
      if (!data) {
        throw new Error('No data received from server');
      }
      
      const { faculty, courses, students, enrollments, grades } = data;
      
      // Validate required data
      if (!faculty || !courses || !students || !enrollments || !grades) {
        console.error('Missing required data in response:', { faculty, courses, students, enrollments, grades });
        throw new Error('Incomplete data received from server');
      }
      
      // Process the data to match the expected format
      const coursesWithStudents = courses.map(course => ({
        ...course,
        students: (Array.isArray(students) ? students : [])
          .filter(student => 
            (Array.isArray(enrollments) ? enrollments : [])
              .some(e => e.course === course.id && e.student === student.id)
          )
          .map(student => {
            const enrollment = (Array.isArray(enrollments) ? enrollments : [])
              .find(e => e.course === course.id && e.student === student.id);
              
            const grade = enrollment && Array.isArray(grades) 
              ? grades.find(g => g.enrollment === enrollment.id)
              : null;
              
            return {
              ...student,
              enrollments: enrollment ? [enrollment] : [],
              grade: grade || null
            };
          })
      }));
      
      setDashboardData({
        faculty,
        courses: coursesWithStudents,
        students: Array.isArray(students) ? students : [],
        grades: Array.isArray(grades) ? grades : [],
        loading: false,
        error: null
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Don't show error for canceled requests
      if (error?.name === 'CanceledError' || error?.message?.includes('canceled')) {
        console.log('Request was canceled, ignoring error');
        return;
      }
      
      const errorMessage = error.message || 'Failed to load dashboard data';
      
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
        autoHideDuration: 10000 // Show error for 10 seconds
      });
    }
  }, [get]);

  // Handle grade change
  const handleGradeChange = (studentId, value) => {
    // Only update if the value has changed
    if (gradeInputs[studentId] !== value) {
      setGradeInputs(prev => ({
        ...prev,
        [studentId]: value === '' ? undefined : value
      }));
      
      // If there's an existing grade and the user cleared it, show a confirmation
      const student = dashboardData.students.find(s => s.id === parseInt(studentId));
      const hasExistingGrade = student?.grade?.value;
      
      if (hasExistingGrade && !value) {
        if (window.confirm('Are you sure you want to remove this grade?')) {
          // Grade will be removed when submitted
        } else {
          // Revert the change
          setGradeInputs(prev => ({
            ...prev,
            [studentId]: hasExistingGrade
          }));
        }
      }
    }
  };

  // Handle grade submission
  const handleSubmitGrades = async (courseId) => {
    if (!courseId) {
      console.error('No course ID provided for grade submission');
      setSnackbar({
        open: true,
        message: 'Error: No course specified',
        severity: 'error'
      });
      return;
    }

    try {
      // Get all grades that have been modified or removed
      const gradesToSubmit = [];
      const gradesToRemove = [];
      
      // Process each modified grade
      for (const [studentId, grade] of Object.entries(gradeInputs)) {
        // Find the student and their enrollment for this course
        const student = dashboardData.students.find(s => s.id === parseInt(studentId));
        if (!student) continue;
        
        const enrollment = student.enrollments?.find(e => e.course_id === courseId);
        if (!enrollment) {
          console.warn(`No enrollment found for student ${studentId} in course ${courseId}`);
          continue;
        }
        
        const existingGrade = student.grade?.value;
        
        // If grade is empty or undefined and there was an existing grade, mark for removal
        if ((grade === undefined || grade === '') && existingGrade) {
          gradesToRemove.push({
            enrollment_id: enrollment.id,
            student_id: parseInt(studentId),
            course_id: courseId
          });
        } 
        // If grade has a value and it's different from the existing grade, mark for update
        else if (grade && grade !== existingGrade) {
          gradesToSubmit.push({
            enrollment_id: enrollment.id,
            student_id: parseInt(studentId),
            course_id: courseId,
            value: grade
          });
        }
      }

      if (gradesToSubmit.length === 0 && gradesToRemove.length === 0) {
        setSnackbar({
          open: true,
          message: 'No changes to submit. Please modify at least one grade.',
          severity: 'info',
          autoHideDuration: 3000
        });
        return;
      }

      // Show loading state
      setDashboardData(prev => ({ ...prev, loading: true }));
      
      try {
        // Submit new/updated grades in bulk if there are any
        if (gradesToSubmit.length > 0) {
          await post('/api/grades/bulk/', gradesToSubmit);
        }
        
        // Remove grades marked for deletion if there are any
        if (gradesToRemove.length > 0) {
          // We'll need to delete each grade individually since we need the enrollment ID
          await Promise.all(
            gradesToRemove.map(grade => 
              api.delete(`/api/grades/${grade.enrollment_id}/`)
                .catch(err => {
                  console.error(`Failed to remove grade for student ${grade.student_id}:`, err);
                  // Don't reject the entire promise if one deletion fails
                  return null;
                })
            )
          );
        }
        
        // Clear the grade inputs for submitted/removed grades
        setGradeInputs(prev => {
          const newInputs = { ...prev };
          [...gradesToSubmit, ...gradesToRemove].forEach(grade => {
            if (grade) {
              delete newInputs[grade.student_id];
            }
          });
          return newInputs;
        });
        
        // Prepare success message
        let successMessage = '';
        if (gradesToSubmit.length > 0 && gradesToRemove.length > 0) {
          successMessage = `Successfully updated ${gradesToSubmit.length} grades and removed ${gradesToRemove.length} grades.`;
        } else if (gradesToSubmit.length > 0) {
          successMessage = `Successfully ${gradesToSubmit.length === 1 ? 'updated 1 grade' : `updated ${gradesToSubmit.length} grades`}.`;
        } else if (gradesToRemove.length > 0) {
          successMessage = `Successfully removed ${gradesToRemove.length} ${gradesToRemove.length === 1 ? 'grade' : 'grades'}.`;
        }
        
        // Show success message
        setSnackbar({
          open: true,
          message: successMessage,
          severity: 'success',
          autoHideDuration: 5000
        });
        
        // Refresh dashboard data
        await fetchDashboardData();
        
      } catch (error) {
        // This will be caught by the outer catch block
        throw error;
      }
      
    } catch (error) {
      console.error('Failed to submit grades:', error);
      
      // More detailed error handling
      let errorMessage = 'Failed to submit grades';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.data) {
          if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (Array.isArray(error.response.data)) {
            errorMessage = error.response.data.map(err => 
              `${err.field || 'Error'}: ${err.message || 'Unknown error'}`
            ).join('; ');
          } else if (typeof error.response.data === 'object') {
            errorMessage = Object.entries(error.response.data)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
              .join('; ');
          }
        }
        
        if (error.response.status === 400) {
          errorMessage = `Validation error: ${errorMessage}`;
        } else if (error.response.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (error.response.status === 404) {
          errorMessage = 'Resource not found. Please refresh the page and try again.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your internet connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message || 'An unknown error occurred';
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
        autoHideDuration: 10000 // Show error messages longer
      });
      
      // Reset loading state
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle accordion change
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
    if (isExpanded) {
      setSelectedCourse(panel);
    }
  };

  // Close snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Fetch data on component mount
  useEffect(() => {
    // Create a flag to track if the component is still mounted
    let isMounted = true;
    
    // Function to load data
    const loadData = async () => {
      try {
        await fetchDashboardData();
      } catch (error) {
        console.error('Error in fetchDashboardData:', error);
        if (isMounted) {
          setDashboardData(prev => ({
            ...prev,
            loading: false,
            error: error.message || 'Failed to load dashboard data'
          }));
        }
      }
    };
    
    // Initial data load
    loadData();
    
    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      if (isMounted) {
        loadData();
      }
    }, 30000);
    
    // Cleanup function
    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, [fetchDashboardData]);

  // Render loading state
  if (dashboardData.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (dashboardData.error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {dashboardData.error || 'Failed to load dashboard data. Please try again later.'}
        </Alert>
      </Box>
    );
  }

  // Get students for the selected course
  const getCourseStudents = (courseId) => {
    if (!dashboardData.courses) return [];
    
    // Find the course
    const course = dashboardData.courses.find(c => c.id === courseId);
    if (!course || !course.students) return [];
    
    return course.students.map(student => ({
      ...student,
      // Ensure enrollments is always an array
      enrollments: student.enrollments || []
    }));
  };

  // Calculate course statistics
  const calculateCourseStats = (courseId) => {
    const course = dashboardData.courses?.find(c => c.id === courseId);
    if (!course) return { totalStudents: 0, gradedStudents: 0, averageGrade: 0 };
    
    const students = course.students || [];
    const totalStudents = students.length;
    
    // Get all grades for this course
    const grades = students
      .map(student => student.grade?.value)
      .filter(grade => grade !== undefined && grade !== null);
      
    const gradedStudents = grades.length;
    
    // Calculate average grade (convert letter grades to GPA points)
    const gradeToPoints = {
      'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0
    };
    
    const totalPoints = grades.reduce((sum, grade) => {
      return sum + (gradeToPoints[grade] || 0);
    }, 0);
    
    const averageGrade = gradedStudents > 0 
      ? (totalPoints / gradedStudents).toFixed(2)
      : 0;

    return {
      totalStudents,
      gradedStudents,
      averageGrade: parseFloat(averageGrade) // Convert to number
    };
  };

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 64px)',
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      width: '100%',
      maxWidth: '100%',
      overflow: 'auto'
    }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Welcome Section */}
      <Box sx={{ mb: 4, width: '100%' }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {dashboardData.faculty?.name || 'Professor'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Faculty ID: {dashboardData.faculty?.faculty_id || 'N/A'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Department: {dashboardData.faculty?.department || 'N/A'}
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ flex: 1 }}>
        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Teaching Summary</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Courses Teaching</Typography>
                  <Typography variant="h5">{dashboardData.courses.length}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Total Students</Typography>
                  <Typography variant="h5">
                    {dashboardData.courses.reduce((total, course) => {
                      return total + (course.students?.length || 0);
                    }, 0)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Grading Progress</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <Box 
                        sx={{
                          height: 8,
                          bgcolor: 'divider',
                          borderRadius: 4,
                          overflow: 'hidden'
                        }}
                      >
                        <Box 
                          sx={{
                            height: '100%',
                            width: '60%',
                            bgcolor: 'primary.main',
                            borderRadius: 4
                          }}
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      60%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* My Courses */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>My Courses</Typography>
            <Divider sx={{ mb: 2 }} />
            
            {dashboardData.courses.length > 0 ? (
              dashboardData.courses.map((course) => {
                const stats = calculateCourseStats(course.id);
                const students = getCourseStudents(course.id);
                
                return (
                  <Accordion 
                    key={course.id} 
                    expanded={expanded === course.id}
                    onChange={handleAccordionChange(course.id)}
                    sx={{ mb: 2 }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography>{course.name} ({course.code})</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {course.term} • {course.department}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Chip 
                            label={`${stats.gradedStudents}/${stats.totalStudents || 0} Graded`} 
                            size="small" 
                            color={
                              !stats.totalStudents ? 'default' : 
                              stats.gradedStudents === stats.totalStudents ? 'success' : 'warning'
                            }
                            variant="outlined"
                          />
                          <Chip 
                            label={`GPA: ${stats.averageGrade.toFixed(2)}`} 
                            size="small" 
                            color={
                              stats.averageGrade >= 3.5 ? 'success' :
                              stats.averageGrade >= 2.5 ? 'primary' :
                              stats.averageGrade > 0 ? 'warning' : 'default'
                            }
                            variant="outlined"
                          />
                          {stats.totalStudents > 0 && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              {stats.totalStudents} {stats.totalStudents === 1 ? 'student' : 'students'}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Student</TableCell>
                              <TableCell>ID</TableCell>
                              <TableCell>Grade</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {students.map((student) => {
                              // Find the student's enrollment for this course
                              const enrollment = student.enrollments?.find(e => e.course_id === course.id);
                              
                              // Find existing grade for this student and course
                              const existingGrade = dashboardData.grades.find(
                                g => g.enrollment?.student?.id === student.id && 
                                     g.enrollment?.course?.id === course.id
                              );
                              
                              // Determine the current grade value (from inputs or existing grade)
                              const currentGrade = gradeInputs[student.id] !== undefined 
                                ? gradeInputs[student.id] 
                                : existingGrade?.value || '';
                              
                              return (
                                <TableRow key={student.id}>
                                  <TableCell>{student.name}</TableCell>
                                  <TableCell>{student.student_id || 'N/A'}</TableCell>
                                  <TableCell>
                                    <TextField
                                      select
                                      size="small"
                                      value={currentGrade}
                                      onChange={(e) => handleGradeChange(student.id, e.target.value)}
                                      sx={{ minWidth: 100 }}
                                      disabled={!enrollment}
                                      helperText={!enrollment ? 'Not enrolled' : ''}
                                    >
                                      {['', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'].map((grade) => (
                                        <MenuItem key={grade || 'none'} value={grade}>
                                          {grade || 'Select Grade'}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                  </TableCell>
                                  <TableCell>
                                    <Button 
                                      size="small" 
                                      variant="contained" 
                                      color="primary"
                                      onClick={() => handleSubmitGrades(course.id)}
                                      disabled={apiLoading || !gradeInputs[student.id]}
                                      startIcon={apiLoading ? <CircularProgress size={20} /> : null}
                                    >
                                      {apiLoading ? 'Saving...' : 'Save'}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          onClick={() => handleSubmitGrades(course.id)}
                          disabled={apiLoading}
                          startIcon={apiLoading ? <CircularProgress size={20} /> : null}
                        >
                          {apiLoading ? 'Saving...' : 'Save All Grades'}
                        </Button>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                );
              })
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No courses assigned for the current term.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FacultyDashboard;
