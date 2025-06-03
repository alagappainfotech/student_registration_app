import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  CircularProgress,
  Grid,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Snackbar,
  Alert as MuiAlert,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import useApi from '../hooks/useApi';

// Custom Alert component for snackbar
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { get, loading, error, setError } = useApi();
  
  const [dashboardData, setDashboardData] = useState({
    student: null,
    courses: [],
    grades: [],
    loading: true,
    error: null
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Validate user session
  const validateSession = useCallback(() => {
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role');

    if (!token || userRole?.toLowerCase() !== 'student') {
      localStorage.clear();
      navigate('/login', { replace: true });
      return false;
    }
    return true;
  }, [navigate]);

  // Mock data for student dashboard
  const mockStudentData = {
    student: {
      name: 'John Doe',
      student_id: 'STU2023001',
      current_semester: 'Fall 2023',
      completed_credits: 45,
      total_required_credits: 120
    },
    courses: [
      { id: 1, code: 'CS101', name: 'Introduction to Computer Science', instructor: 'Dr. Smith', schedule: 'Mon/Wed 10:00 AM - 11:30 AM', status: 'In Progress' },
      { id: 2, code: 'MATH201', name: 'Linear Algebra', instructor: 'Prof. Johnson', schedule: 'Tue/Thu 1:00 PM - 2:30 PM', status: 'In Progress' },
      { id: 3, code: 'PHYS101', name: 'Physics I', instructor: 'Dr. Williams', schedule: 'Mon/Wed/Fri 9:00 AM - 10:00 AM', status: 'In Progress' }
    ],
    grades: [
      { id: 1, course_id: 1, course_name: 'Introduction to Computer Science', assignment_name: 'Midterm Exam', grade: 'A', feedback: 'Excellent work!', submitted_at: '2023-10-15' },
      { id: 2, course_id: 1, course_name: 'Introduction to Computer Science', assignment_name: 'Final Project', grade: 'A', feedback: 'Great job on the project!', submitted_at: '2023-12-10' },
      { id: 3, course_id: 2, course_name: 'Linear Algebra', assignment_name: 'Quiz 1', grade: 'B+', feedback: 'Good effort, review matrix operations', submitted_at: '2023-10-20' }
    ]
  };

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!validateSession()) return;

    try {
      setDashboardData(prev => ({ ...prev, loading: true }));
      
      // Use mock data for now
      // Uncomment this when backend is ready
      /*
      const response = await get('/api/dashboard/student/');
      
      if (response.data) {
        setDashboardData({
          student: response.data.student || null,
          courses: response.data.courses || [],
          grades: response.data.grades || [],
          loading: false,
          error: null
        });
      }
      */
      
      // Use mock data
      setDashboardData({
        student: mockStudentData.student,
        courses: mockStudentData.courses,
        grades: mockStudentData.grades,
        loading: false,
        error: null
      });
      
    } catch (error) {
      console.error('Failed to fetch student dashboard data:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to load dashboard data';
      
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });

      // Redirect to login on 401 Unauthorized
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login', { replace: true });
      }
    }
  }, [get, navigate, validateSession]);

  // Effect to load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle error state changes
  useEffect(() => {
    if (error) {
      setSnackbar({
        open: true,
        message: error.message || 'An error occurred',
        severity: 'error'
      });
    }
  }, [error]);

  // Handle course registration
  const handleRegisterCourse = async (courseId) => {
    try {
      await get(`/api/courses/${courseId}/register/`);
      setSnackbar({
        open: true,
        message: 'Successfully registered for the course',
        severity: 'success'
      });
      // Refresh dashboard data
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to register for course:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to register for course',
        severity: 'error'
      });
    }
  };

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

  // Calculate GPA if grades exist
  const calculateGPA = () => {
    if (!dashboardData.grades.length) return 'N/A';
    
    const totalPoints = dashboardData.grades.reduce((sum, grade) => {
      // Convert letter grade to GPA points (simplified)
      const gradeMap = { 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'F': 0 };
      return sum + (gradeMap[grade.grade] || 0);
    }, 0);
    
    return (totalPoints / dashboardData.grades.length).toFixed(2);
  };

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 64px)', // Subtract header height
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
          Welcome, {dashboardData.student?.name || 'Student'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Student ID: {dashboardData.student?.student_id || 'N/A'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Current Semester: {dashboardData.student?.current_semester || 'N/A'}
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ flex: 1 }}>
        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Academic Summary</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Current GPA</Typography>
                  <Typography variant="h5">{calculateGPA()}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Enrolled Courses</Typography>
                  <Typography variant="h5">{dashboardData.courses.length}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Completed Credits</Typography>
                  <Typography variant="h5">
                    {dashboardData.student?.completed_credits || 0} / {dashboardData.student?.total_required_credits || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Enrolled Courses */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>My Courses</Typography>
            <Divider sx={{ mb: 2 }} />
            {dashboardData.courses.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Course Code</TableCell>
                      <TableCell>Course Name</TableCell>
                      <TableCell>Instructor</TableCell>
                      <TableCell>Schedule</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>{course.code}</TableCell>
                        <TableCell>{course.name}</TableCell>
                        <TableCell>{course.instructor}</TableCell>
                        <TableCell>{course.schedule}</TableCell>
                        <TableCell>
                          <Chip 
                            label={course.status || 'Enrolled'} 
                            color={course.status === 'Completed' ? 'success' : 'primary'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No courses found. Browse available courses to enroll.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Grades */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>My Grades</Typography>
            <Divider sx={{ mb: 2 }} />
            {dashboardData.grades.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Course</TableCell>
                      <TableCell>Assignment</TableCell>
                      <TableCell>Grade</TableCell>
                      <TableCell>Feedback</TableCell>
                      <TableCell>Submitted On</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.grades.map((grade, index) => (
                      <TableRow key={index}>
                        <TableCell>{grade.course_name}</TableCell>
                        <TableCell>{grade.assignment_name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={grade.grade} 
                            color={
                              grade.grade === 'A' ? 'success' : 
                              ['B', 'C'].includes(grade.grade) ? 'primary' : 'error'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{grade.feedback || 'No feedback available'}</TableCell>
                        <TableCell>{new Date(grade.submitted_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No grades available yet.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
