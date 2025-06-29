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

const FacultyList = ({ userRole }) => {
  const [faculty, setFaculty] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    qualification: '',
    specialization: '',
    organization_id: '',
    years_of_experience: ''
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const [facultyRes, orgsRes] = await Promise.all([
        axios.get('/api/faculty/', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/organizations/', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      console.log('Organizations data:', orgsRes.data);
      setFaculty(facultyRes.data);
      setOrganizations(orgsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Handle unauthorized access
        setError('You do not have permission to access this page.');
      } else {
        setError('Failed to load data. Please try again.');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setSelectedFaculty(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      qualification: '',
      specialization: '',
      organization_id: organizations.length > 0 ? organizations[0].id : '',
      years_of_experience: ''
    });
    setOpenDialog(true);
  };

  const handleEdit = (faculty) => {
    setSelectedFaculty(faculty);
    setFormData({
      name: faculty.name,
      email: faculty.email,
      phone: faculty.phone || '',
      qualification: faculty.qualification || '',
      specialization: faculty.specialization || '',
      organization_id: faculty.organization?.id || '',
      years_of_experience: faculty.years_of_experience || ''
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.delete(`/api/faculty/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
      } catch (error) {
        console.error('Failed to delete faculty:', error);
        setError('Failed to delete faculty member. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      
      // Parse numeric fields before submission
      const data = {
        ...formData,
        years_of_experience: parseInt(formData.years_of_experience, 10) || 0
      };
      
      console.log('Submitting faculty data:', data);
      
      if (selectedFaculty) {
        await axios.put(`/api/faculty/${selectedFaculty.id}/`, data, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        const response = await axios.post('/api/faculty/', data, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Faculty created successfully:', response.data);
      }
      setOpenDialog(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save faculty:', error);
      if (error.response?.data) {
        console.error('Error details:', JSON.stringify(error.response.data));
      }
      setError('Failed to save faculty member. Please try again.');
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
          <Typography variant="h5">Faculty Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Add Faculty
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Qualification</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>Experience (Years)</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {faculty.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{f.name}</TableCell>
                  <TableCell>{f.email}</TableCell>
                  <TableCell>{f.qualification}</TableCell>
                  <TableCell>{f.specialization}</TableCell>
                  <TableCell>{f.years_of_experience}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(f)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(f.id)}>
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
            {selectedFaculty ? 'Edit Faculty' : 'Add Faculty'}
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
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel id="organization-label">Organization</InputLabel>
                    <Select
                      labelId="organization-label"
                      id="organization"
                      name="organization_id"
                      value={formData.organization_id}
                      label="Organization"
                      onChange={handleChange}
                    >
                      {organizations.map((org) => (
                        <MenuItem key={org.id} value={org.id}>
                          {org.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Years of Experience"
                    name="years_of_experience"
                    type="number"
                    value={formData.years_of_experience}
                    onChange={handleChange}
                    required
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                {selectedFaculty ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default FacultyList;
