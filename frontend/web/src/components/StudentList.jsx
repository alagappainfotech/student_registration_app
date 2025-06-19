import React, { useEffect, useState } from 'react';
import {
  Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  CircularProgress, Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton, MenuItem, Select, FormControl,
  InputLabel, Chip, ListItemText, Checkbox, TableContainer
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import axiosInstance from '@/services/axiosConfig';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
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
    const token = localStorage.getItem('access_token');
    try {
      const response = await axiosInstance.get('/api/courses/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
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

  const handleOpenEnrollDialog = (student) => {
    console.log('Opening enrollment dialog for student:', student);
    setSelectedStudent(student);
    const courseIds = student.courses?.map(course => course.id) || [];
    console.log('Setting initial selected courses:', courseIds);
    setSelectedCourses(courseIds);
    setOpenEnrollDialog(true);
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
        await axiosInstance.put(`/api/students/${selectedStudent.id}/`, formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        await axiosInstance.post('/api/students/', formData, {
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
      await axiosInstance.delete(`/api/students/${id}/`, {
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
      
      const response = await axiosInstance.patch(
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
      const response = await axiosInstance.get('/api/students/', {
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

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

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
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              margin="normal"
              required
              error={!!errors.phone}
              helperText={errors.phone}
              placeholder="+1234567890"
            />
            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              margin="normal"
              required
              error={!!errors.date_of_birth}
              helperText={errors.date_of_birth}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              margin="normal"
              multiline
              rows={3}
              required
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
      <Dialog open={openEnrollDialog} onClose={handleCloseEnrollDialog}>
        <DialogTitle>Manage Course Enrollments</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="courses-select-label">Courses</InputLabel>
            <Select
              labelId="courses-select-label"
              multiple
              value={selectedCourses || []}
              onChange={(e) => {
                console.log('Selected courses changed:', e.target.value);
                setSelectedCourses(e.target.value);
              }}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const courseName = courses.find(course => course.id === value)?.name || value;
                    return (
                      <Chip
                        key={value}
                        label={courseName}
                        sx={{ m: 0.5 }}
                      />
                    );
                  })}
                </Box>
              )}
            >
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  <Checkbox checked={selectedCourses?.indexOf(course.id) > -1} />
                  <ListItemText primary={course.name} secondary={`ID: ${course.id}`} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
