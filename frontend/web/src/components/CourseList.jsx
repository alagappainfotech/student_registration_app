import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axiosInstance from '@/services/axiosConfig';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    fees: '',
    primary_faculty: '',
    daily_duration: '',
    total_duration: ''
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const [coursesRes, facultyRes] = await Promise.all([
        axios.get('/api/courses/', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/faculty/', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setCourses(coursesRes.data);
      setFaculty(facultyRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load data. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setSelectedCourse(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      fees: '',
      primary_faculty: '',
      daily_duration: '',
      total_duration: ''
    });
    setOpenDialog(true);
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      description: course.description || '',
      fees: course.fees || '',
      primary_faculty: course.primary_faculty?.id || '',
      daily_duration: course.daily_duration || '',
      total_duration: course.total_duration || ''
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const token = localStorage.getItem('access_token');
        await axiosInstance.delete(`/api/courses/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
      } catch (error) {
        console.error('Failed to delete course:', error);
        setError('Failed to delete course. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const data = {
        ...formData,
        fees: parseFloat(formData.fees),
        daily_duration: parseInt(formData.daily_duration),
        total_duration: parseInt(formData.total_duration)
      };

      if (selectedCourse) {
        await axiosInstance.put(`/api/courses/${selectedCourse.id}/`, data, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        await axiosInstance.post('/api/courses/', data, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      setOpenDialog(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save course:', error);
      setError('Failed to save course. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, p: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Course Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Add Course
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Fees</TableCell>
                <TableCell>Faculty</TableCell>
                <TableCell>Duration (Hours)</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{course.code}</TableCell>
                  <TableCell>{course.description}</TableCell>
                  <TableCell>${course.fees}</TableCell>
                  <TableCell>{course.primary_faculty_name}</TableCell>
                  <TableCell>{course.total_duration}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(course)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(course.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedCourse ? 'Edit Course' : 'Add Course'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Fees"
                    name="fees"
                    type="number"
                    value={formData.fees}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Primary Faculty</InputLabel>
                    <Select
                      name="primary_faculty"
                      value={formData.primary_faculty}
                      onChange={handleChange}
                    >
                      {faculty.map((f) => (
                        <MenuItem key={f.id} value={f.id}>
                          {f.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Daily Duration (Hours)"
                    name="daily_duration"
                    type="number"
                    value={formData.daily_duration}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Total Duration (Hours)"
                    name="total_duration"
                    type="number"
                    value={formData.total_duration}
                    onChange={handleChange}
                    required
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                {selectedCourse ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default CourseList;
