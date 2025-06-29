import React, { useEffect, useState } from 'react';
import {
  Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  CircularProgress, Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton, MenuItem, Select, FormControl,
  InputLabel, Chip, ListItemText, Checkbox, TableContainer
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEnrollDialog, setOpenEnrollDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    address: ''
  });
  const [selectedCourses, setSelectedCourses] = useState([]);

  const fetchCourses = async () => {
    try {
      console.log('Starting course fetch operation...');
      setLoadingCourses(true); // Set loading state
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No access token found. Cannot fetch courses.');
        return [];
      }

      console.log('Fetching courses with token:', token.substring(0, 10) + '...');
      
      // Try both endpoints to ensure compatibility
      let response;
      try {
        // First try without the trailing slash
        console.log('Attempting to fetch courses from /api/courses');
        response = await axios.get('/api/courses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (firstError) {
        console.warn('First attempt failed, trying with trailing slash:', firstError.message);
        // If that fails, try with a trailing slash
        console.log('Attempting to fetch courses from /api/courses/');
        response = await axios.get('/api/courses/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      
      console.log('Courses API response status:', response.status);
      console.log('Courses API response headers:', response.headers);
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`Successfully loaded ${response.data.length} courses:`, JSON.stringify(response.data, null, 2));
        
        // Ensure all course objects have the expected properties
        const processedCourses = response.data.map(course => ({
          ...course,
          id: String(course.id), // Ensure ID is a string
          name: course.name || 'Unnamed Course'
        }));
        
        console.log('Processed courses:', processedCourses);
        setCourses(processedCourses);
        return processedCourses;
      } else {
        console.error('Invalid courses data format:', response.data);
        setCourses([]); // Set empty array to avoid mapping errors
        return [];
      }
    } catch (error) {
      console.error('Error fetching courses:', 
        error.response ? 
          `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}` : 
          error.message
      );
      setCourses([]); // Set empty array to avoid mapping errors
      return [];
    } finally {
      setLoadingCourses(false); // Always reset loading state
    }
  };

  const handleOpenDialog = (student = null) => {
    setErrors({});
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        date_of_birth: student.date_of_birth || '',
        address: student.address || ''
      });
      setSelectedStudent(student);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        address: ''
      });
      setSelectedStudent(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      address: ''
    });
  };

  const handleOpenEnrollDialog = async (student) => {
    console.log('Opening enrollment dialog for student:', JSON.stringify(student));
    
    // First set the dialog state and student
    setOpenEnrollDialog(true);
    setSelectedStudent(student);
    
    // Reset courses selection initially to avoid stale data
    setSelectedCourses([]);
    
    // Now try to load courses for the dropdown
    try {
      // Fetch courses first
      const loadedCourses = await fetchCourses();
      console.log('Loaded courses in dialog:', loadedCourses);
      
      // Only after courses are loaded, set the selected courses
      if (student?.courses && Array.isArray(student.courses)) {
        // Extract course IDs and ensure they're strings
        const courseIds = student.courses.map(course => {
          if (typeof course === 'object' && course.id) {
            return String(course.id);
          } else if (typeof course === 'number' || typeof course === 'string') {
            return String(course);
          }
          return null;
        }).filter(id => id !== null);
        
        console.log('Setting selected course IDs:', courseIds);
        setSelectedCourses(courseIds);
      } else {
        console.log('No courses found for student, setting empty selection');
        setSelectedCourses([]);
      }
    } catch (error) {
      console.error('Failed to load courses for enrollment dialog:', error);
      // Ensure we still have an empty array rather than undefined
      setSelectedCourses([]);
    }
  };

  const handleCloseEnrollDialog = () => {
    setOpenEnrollDialog(false);
    setSelectedStudent(null);
    setSelectedCourses([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate the form data
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const token = localStorage.getItem('access_token');
    try {
      if (selectedStudent) {
        await axios.put(`/api/students/${selectedStudent.id}/`, formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/students/', formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      setErrors({});
      fetchStudents();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving student:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    const token = localStorage.getItem('access_token');
    try {
      await axios.delete(`/api/students/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const [errors, setErrors] = useState({});

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.name?.trim()) newErrors.name = 'Name is required';
    if (!data.email?.trim()) newErrors.email = 'Email is required';
    if (!data.phone?.trim()) newErrors.phone = 'Phone is required';
    if (!data.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!data.address?.trim()) newErrors.address = 'Address is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
      newErrors.email = 'Invalid email format';
    }

    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (data.phone && !phoneRegex.test(data.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    return newErrors;
  };

  const handleEnrollmentSubmit = async () => {
    console.log('Submitting enrollment update...');
    console.log('Selected student:', JSON.stringify(selectedStudent, null, 2));
    console.log('Selected courses:', JSON.stringify(selectedCourses, null, 2));

    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found');
      return;
    }

    if (!selectedStudent?.id) {
      console.error('No student selected');
      return;
    }

    // Only send courses_ids for enrollment update
    const updateData = {
      courses_ids: selectedCourses
    };

    console.log('Update data:', JSON.stringify(updateData, null, 2));

    try {
      console.log('Making API call to update enrollments...');
      console.log('URL:', `/api/students/${selectedStudent.id}/`);
      console.log('Headers:', { 'Authorization': `Bearer ${token}` });
      
      const response = await axios.patch(
        `/api/students/${selectedStudent.id}/`,
        updateData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      console.log('Enrollment update successful:', JSON.stringify(response.data, null, 2));
      
      setErrors({});
      await fetchStudents();
      handleCloseEnrollDialog();
    } catch (error) {
      console.error('Error updating enrollments:', error);
      if (error.response?.data) {
        console.error('Server error response:', JSON.stringify(error.response.data, null, 2));
        setErrors(error.response.data);
      } else if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    }
  };

  const fetchStudents = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('/api/students/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect to load students and courses on initial component load
  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);
  
  // Dedicated effect to ensure courses are loaded when enrollment dialog opens
  // and to debug what's happening with the dropdown
  useEffect(() => {
    if (openEnrollDialog) {
      console.log('Enrollment dialog opened - ensuring courses are loaded');
      console.log('Current courses state:', courses);
      console.log('Current selectedCourses:', selectedCourses);
      
      // Force courses to load again
      fetchCourses().then(freshCourses => {
        console.log('Fresh courses loaded in effect:', freshCourses?.length || 0);
        
        // Double check that selectedCourses is properly set
        if (selectedStudent?.courses && selectedCourses.length === 0) {
          const courseIds = selectedStudent.courses
            .map(c => typeof c === 'object' ? String(c.id) : String(c))
            .filter(Boolean);
          console.log('Setting missing selectedCourses:', courseIds);
          setSelectedCourses(courseIds);
        }
      });
    }
  }, [openEnrollDialog, selectedStudent]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Paper sx={{ mt: 6, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Manage Students</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Add New Student
        </Button>
      </Box>

      {!students.length ? (
        <Typography align="center" sx={{ mt: 4 }}>No students registered yet.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Date of Birth</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Courses</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map(s => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>{s.phone}</TableCell>
                <TableCell>{s.date_of_birth}</TableCell>
                <TableCell>{s.address}</TableCell>
                <TableCell>
                  {s.courses?.map(c => (
                    <Chip key={c.id} label={c.name} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(s)} size="small" sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(s.id)} size="small" sx={{ mr: 1 }}>
                    <DeleteIcon />
                  </IconButton>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenEnrollDialog(s)}
                  >
                    Manage Courses
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Add/Edit Student Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
              autoFocus
              inputProps={{
                style: { padding: '12px 14px' },
                onClick: (e) => e.target.focus()
              }}
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
              inputProps={{
                style: { padding: '12px 14px' },
                onClick: (e) => e.target.focus()
              }}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              margin="normal"
              required
              inputProps={{
                style: { padding: '12px 14px' },
                onClick: (e) => e.target.focus()
              }}
              error={!!errors.phone}
              helperText={errors.phone}
              placeholder="+1234567890"
            />
            <TextField
              fullWidth
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              margin="normal"
              required
              inputProps={{
                style: { padding: '12px 14px' },
                onClick: (e) => e.target.focus()
              }}
              error={!!errors.date_of_birth}
              helperText={errors.date_of_birth}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              margin="normal"
              required
              multiline
              rows={3}
              inputProps={{
                style: { padding: '12px 14px' },
                onClick: (e) => e.target.focus()
              }}
              error={!!errors.address}
              helperText={errors.address}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedStudent ? 'Update' : 'Add'} Student
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Enrollments Dialog */}
      <Dialog open={openEnrollDialog} onClose={handleCloseEnrollDialog} maxWidth="md" fullWidth>
        <DialogTitle>Manage Course Enrollments</DialogTitle>
        {selectedStudent && (
          <Box sx={{ px: 3, pt: 0, pb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'normal' }}>
              Student: {selectedStudent.name}
            </Typography>
          </Box>
        )}
        <DialogContent>
          {loadingCourses ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 4 }}>
              <CircularProgress size={24} sx={{ mr: 2 }} />
              <Typography>Loading courses...</Typography>
            </Box>
          ) : (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel htmlFor="courses-select" id="courses-select-label">Courses</InputLabel>
              <Select
                labelId="courses-select-label"
                id="courses-select"
                label="Courses"
                multiple
                value={selectedCourses || []}
                onChange={(e) => {
                  console.log('Selected courses changed:', e.target.value);
                  setSelectedCourses(e.target.value);
                }}
                MenuProps={{
                  PaperProps: {
                    style: { maxHeight: 300 },
                  },
                }}
                sx={{ minHeight: '56px' }}
              renderValue={(selected) => {
                console.log('Rendering selected values:', selected);
                console.log('Available courses:', courses);
                
                if (!selected || selected.length === 0) {
                  return <em>No courses selected</em>;
                }
                
                return (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      // Convert values to strings for comparison if needed
                      const valueStr = String(value);
                      const course = courses.find(c => String(c.id) === valueStr);
                      const courseName = course ? course.name : valueStr;
                      
                      return (
                        <Chip
                          key={valueStr}
                          label={courseName || `Course ${valueStr}`}
                          sx={{ m: 0.5 }}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                );
              }}
            >
              {courses && courses.length > 0 ? (
                courses.map((course) => {
                  const courseId = String(course.id);
                  const isSelected = selectedCourses?.some(id => String(id) === courseId);
                  console.log('Rendering course item:', courseId, course.name, 'Selected:', isSelected);
                  
                  return (
                    <MenuItem key={courseId} value={courseId} dense>
                      <Checkbox checked={isSelected} />
                      <ListItemText 
                        primary={course.name || 'Unnamed Course'} 
                        secondary={course.primary_faculty_name || 'No faculty assigned'} 
                      />
                    </MenuItem>
                  );
                })
              ) : (
                <MenuItem disabled>No courses available</MenuItem>
              )}
            </Select>
          </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEnrollDialog}>Cancel</Button>
          <Button 
            onClick={() => {
              console.log('Save Enrollments clicked');
              handleEnrollmentSubmit();
            }} 
            color="primary"
            variant="contained"
          >
            Save Enrollments
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
