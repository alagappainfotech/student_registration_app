import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { 
  Box, 
  Button, 
  Grid, 
  Paper, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  IconButton, 
  Alert, 
  FormHelperText
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';

// Memoize form components to prevent unnecessary re-renders
const MemoizedSelect = React.memo(({ value, onChange, label, children, error, helperText, disabled, ...props }) => (
  <FormControl fullWidth error={!!error} disabled={disabled} {...props}>
    <InputLabel>{label}</InputLabel>
    <Select
      value={value}
      onChange={onChange}
      label={label}
      disabled={disabled}
      sx={{
        '& .MuiSelect-icon': {
          color: 'rgba(0, 0, 0, 0.54)'
        }
      }}
    >
      {children}
    </Select>
    {error && (
      <FormHelperText sx={{ 
        mt: 0.5,
        mx: 0,
        color: '#d32f2f',
        fontSize: '0.75rem',
        lineHeight: 1.2
      }}>
        {error}
      </FormHelperText>
    )}
  </FormControl>
));

const MemoizedMenuItem = React.memo(({ value, children }) => (
  <MenuItem
    value={value}
    sx={{
      borderRadius: 1,
      '&.Mui-selected': {
        backgroundColor: 'rgba(37, 99, 235, 0.08)'
      }
    }}
  >
    {children}
  </MenuItem>
));

const validateProps = ({ token }, navigate) => {
  if (!token) {
    navigate('/login');
    return false;
  }
  return true;
};

export default function StudentRegistrationForm({ token, navigate, studentId }) {
  if (!validateProps({ token }, navigate)) return null;

  const [form, setForm] = useState({
    organization_id: '',
    class_id: '',
    section_id: '',
    courses_ids: [],
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [data, setData] = useState({
    organizations: [],
    classes: [],
    sections: [],
    courses: []
  });
  const [isEditMode, setIsEditMode] = useState(!!studentId);
  const [showPassword, setShowPassword] = useState(false);

  const fetchClasses = useCallback(async (organizationId) => {
    if (!organizationId) return;
    
    try {
      const controller = new AbortController();
      const signal = controller.signal;
      
      const response = await axiosInstance.get(`/api/v1/classes?organization_id=${organizationId}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal
      });
      
      if (!signal.aborted) {
        setData(prev => ({ ...prev, classes: response.data }));
        setForm(prev => ({ 
          ...prev, 
          class_id: '', 
          section_id: '', 
          courses_ids: [] 
        }));
      }
      
      return () => controller.abort();
    } catch (error) {
      if (axios.isCancel(error)) return;
      console.error('Failed to fetch classes:', error);
      setError('Failed to fetch classes. Please try again.');
    }
  }, [token]);

  const fetchSections = useCallback(async (classId) => {
    if (!classId) return;
    
    try {
      const controller = new AbortController();
      const signal = controller.signal;
      
      const response = await axiosInstance.get(`/api/v1/sections?class_id=${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal
      });
      
      if (!signal.aborted) {
        setData(prev => ({ ...prev, sections: response.data }));
        setForm(prev => ({ 
          ...prev, 
          section_id: '', 
          courses_ids: [] 
        }));
      }
      
      return () => controller.abort();
    } catch (error) {
      if (axios.isCancel(error)) return;
      console.error('Failed to fetch sections:', error);
      setError('Failed to fetch sections. Please try again.');
    }
  }, [token]);

  const fetchCourses = useCallback(async (sectionId) => {
    if (!sectionId) return;
    
    try {
      const controller = new AbortController();
      const signal = controller.signal;
      
      const response = await axiosInstance.get(`/api/v1/courses?section_id=${sectionId}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal
      });
      
      if (!signal.aborted) {
        setData(prev => ({ ...prev, courses: response.data }));
        setForm(prev => ({ ...prev, courses_ids: [] }));
      }
      
      return () => controller.abort();
    } catch (error) {
      if (axios.isCancel(error)) return;
      console.error('Failed to fetch courses:', error);
      setError('Failed to fetch courses. Please try again.');
    }
  }, [token]);

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Use functional update to avoid stale state
    setForm(prev => {
      const updates = { [name]: value };
      
      // Handle dependent fields
      if (name === 'organization_id') {
        updates.class_id = '';
        updates.section_id = '';
        updates.courses_ids = [];
        // Use requestAnimationFrame to batch state updates
        requestAnimationFrame(() => {
          if (isMounted.current) {
            fetchClasses(value);
          }
        });
      } else if (name === 'class_id') {
        updates.section_id = '';
        updates.courses_ids = [];
        requestAnimationFrame(() => {
          if (isMounted.current) {
            fetchSections(value);
          }
        });
      } else if (name === 'section_id') {
        updates.courses_ids = [];
        requestAnimationFrame(() => {
          if (isMounted.current) {
            fetchCourses(value);
          }
        });
      }
      
      return { ...prev, ...updates };
    });
    
    // Clear error for the field being edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [formErrors, fetchClasses, fetchSections, fetchCourses]);

  const handleCoursesChange = useCallback((event) => {
    const { value } = event.target;
    const selectedCourses = Array.isArray(value) ? value : [value];
    
    setForm(prev => ({
      ...prev,
      courses_ids: selectedCourses
    }));
    
    // Clear courses error when courses are selected
    if (formErrors.courses_ids) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.courses_ids;
        return newErrors;
      });
    }
  }, [formErrors]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Required fields
    if (!form.organization_id) {
      errors.organization_id = 'Organization is required';
      isValid = false;
    }
    if (!form.class_id) {
      errors.class_id = 'Class is required';
      isValid = false;
    }
    if (!form.section_id) {
      errors.section_id = 'Section is required';
      isValid = false;
    }
    if (!form.courses_ids.length) {
      errors.courses_ids = 'At least one course must be selected';
      isValid = false;
    }
    if (!form.first_name.trim()) {
      errors.first_name = 'First name is required';
      isValid = false;
    }
    if (!form.last_name.trim()) {
      errors.last_name = 'Last name is required';
      isValid = false;
    }
    if (!form.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    if (!form.phone) {
      errors.phone = 'Phone number is required';
      isValid = false;
    }
    if (!form.date_of_birth) {
      errors.date_of_birth = 'Date of birth is required';
      isValid = false;
    }
    if (!form.gender) {
      errors.gender = 'Gender is required';
      isValid = false;
    }
    if (!form.emergency_contact_name) {
      errors.emergency_contact_name = 'Emergency contact name is required';
      isValid = false;
    }
    if (!form.emergency_contact_phone) {
      errors.emergency_contact_phone = 'Emergency contact phone is required';
      isValid = false;
    }

    setFormErrors(errors);
    // Scroll to first error if any
    if (!isValid) {
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
    
    return isValid;
  };

  // Use ref to track mounted state
  const isMounted = useRef(true);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!isMounted.current) return;
    
    // Reset previous errors and states
    setError(null);
    setSuccess(null);
    setFormErrors({});
    
    // Validate form
    const isValid = validateForm();
    
    if (!isValid) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (!isMounted.current) return;
        
        const firstError = Object.keys(formErrors)[0];
        if (firstError) {
          const element = document.querySelector(`[name="${firstError}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      });
      return;
    }
    
    setLoading(true);
    console.log('Submitting form data:', form);
    
    try {
      let response;
      if (isEditMode) {
        response = await axiosInstance.put(`/api/v1/students/${studentId}`, form, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        response = await axiosInstance.post('/api/v1/students/register', form, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      if (response.status === 200 || response.status === 201) {
        const successMessage = isEditMode ? 'Student updated successfully!' : 'Student registered successfully!';
        console.log(successMessage);
        setSuccess(successMessage);
        
        if (!isEditMode) {
          // Reset form for new registration
          setForm({
            organization_id: '',
            class_id: '',
            section_id: '',
            courses_ids: [],
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            address: '',
            date_of_birth: '',
            gender: '',
            emergency_contact_name: '',
            emergency_contact_phone: ''
          });
          
          // Reset dependent data
          setData(prev => ({
            ...prev,
            classes: [],
            sections: [],
            courses: []
          }));
        }
        
        // Navigate to dashboard after a short delay
        const timer = setTimeout(() => {
          navigate('/admin/dashboard');
        }, 2000);
        
        // Cleanup timer if component unmounts
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error(isEditMode ? 'Failed to update student:' : 'Failed to register student:', error);
      
      // Handle validation errors from the server
      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors;
        const newFormErrors = {};
        
        // Map server errors to form fields
        Object.entries(serverErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            newFormErrors[field] = messages[0];
          }
        });
        
        setFormErrors(newFormErrors);
        
        // Show the first error message at the top
        const firstError = Object.keys(newFormErrors)[0];
        if (firstError) {
          setError(newFormErrors[firstError]);
          const element = document.querySelector(`[name="${firstError}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          setError(`Failed to ${isEditMode ? 'update' : 'register'} student. Please try again.`);
        }
      } else {
        // Generic error handling
        setError(error.response?.data?.message || 
                `Failed to ${isEditMode ? 'update' : 'register'} student. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  }, [form, isEditMode, studentId, token, navigate, setLoading, setError, setSuccess, setForm]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    const fetchInitialData = async () => {
      try {
        const response = await axiosInstance.get('/api/v1/organizations', {
          headers: { Authorization: `Bearer ${token}` },
          signal
        });
        
        if (!signal.aborted) {
          setData(prev => ({ ...prev, organizations: response.data }));
        }
      } catch (error) {
        if (axios.isCancel(error)) return;
        console.error('Failed to fetch organizations:', error);
        setError('Failed to load organizations. Please try again.');
      }
    };

    const fetchExistingStudent = async () => {
      if (!studentId) return;
      
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/v1/students/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal
        });
        
        if (signal.aborted) return;
        
        const studentData = response.data;
        const newFormData = {
          organization_id: studentData.organization_id,
          class_id: studentData.class_id,
          section_id: studentData.section_id,
          courses_ids: studentData.courses.map(c => c.id),
          first_name: studentData.first_name,
          last_name: studentData.last_name,
          email: studentData.email,
          phone: studentData.phone,
          address: studentData.address,
          date_of_birth: studentData.date_of_birth,
          gender: studentData.gender,
          emergency_contact_name: studentData.emergency_contact_name,
          emergency_contact_phone: studentData.emergency_contact_phone
        };
        
        setForm(newFormData);

        // Fetch dependent data in parallel
        await Promise.all([
          fetchClasses(studentData.organization_id),
          fetchSections(studentData.class_id),
          fetchCourses(studentData.section_id)
        ]);
      } catch (error) {
        if (axios.isCancel(error)) return;
        console.error('Failed to fetch student data:', error);
        setError('Failed to fetch student data. Please try again.');
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchInitialData();
    if (studentId) {
      fetchExistingStudent();
    }
    
    return () => {
      controller.abort();
    };
  }, [token, studentId, fetchClasses, fetchSections, fetchCourses]);

  // Memoize the form title to prevent unnecessary re-renders
  const formTitle = isEditMode ? 'Edit Student' : 'Register New Student';
  
  // Memoize the back button click handler
  const handleBackClick = useCallback(() => {
    if (isMounted.current) {
      navigate(-1);
    }
  }, [navigate]);

  return (
    <Box
      sx={{
        p: 4,
        bgcolor: 'background.default',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 4
          }}
        >
          <Typography variant="h5" component="h1">
            {formTitle}
          </Typography>
          <IconButton
            color="primary"
            onClick={handleBackClick}
            size="small"
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
            aria-label="Go back"
          >
            <ArrowBack />
          </IconButton>
        </Box>

        {(error || success) && (
          <Alert
            severity={error ? "error" : "success"}
            sx={{
              mb: 2,
              borderRadius: 1,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              '& .MuiAlert-message': {
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }
            }}
          >
            {error || success}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MemoizedSelect
                name="organization_id"
                value={form.organization_id}
                onChange={handleFormChange}
                label="Organization"
                disabled={loading}
                error={formErrors.organization_id}
                helperText={formErrors.organization_id}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.23)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.38)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main'
                    },
                    '&.Mui-error fieldset': {
                      borderColor: '#d32f2f'
                    }
                  },
                  mb: formErrors.organization_id ? 0.5 : 2
                }}
              >
                {data.organizations.map(org => (
                  <MemoizedMenuItem key={org.id} value={org.id}>
                    {org.name}
                  </MemoizedMenuItem>
                ))}
              </MemoizedSelect>
            </Grid>
            <Grid item xs={12}>
              <FormControl
                fullWidth
                error={!!formErrors.class_id}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.23)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.38)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main'
                    },
                    '&.Mui-error fieldset': {
                      borderColor: '#d32f2f'
                    }
                  },
                  mb: formErrors.class_id ? 0.5 : 2
                }}
              >
                <InputLabel>Class</InputLabel>
                <Select
                  name="class_id"
                  value={form.class_id}
                  onChange={handleFormChange}
                  label="Class"
                  disabled={loading || !form.organization_id}
                  sx={{
                    '& .MuiSelect-icon': {
                      color: 'rgba(0, 0, 0, 0.54)'
                    }
                  }}
                >
                  {data.classes.map(cls => (
                    <MenuItem
                      key={cls.id}
                      value={cls.id}
                      sx={{
                        borderRadius: 1,
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(37, 99, 235, 0.08)'
                        }
                      }}
                    >
                      {cls.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.class_id && (
                  <FormHelperText sx={{ 
                    mt: 0.5,
                    mx: 0,
                    color: '#d32f2f',
                    fontSize: '0.75rem',
                    lineHeight: 1.2
                  }}>
                    {formErrors.class_id}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <MemoizedSelect
                name="section_id"
                value={form.section_id}
                onChange={handleFormChange}
                label="Section"
                disabled={loading || !form.class_id}
                error={formErrors.section_id}
                helperText={formErrors.section_id}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.23)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.38)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main'
                    },
                    '&.Mui-error fieldset': {
                      borderColor: '#d32f2f'
                    }
                  },
                  mb: formErrors.section_id ? 0.5 : 2
                }}
              >
                {data.sections.map(section => (
                  <MemoizedMenuItem key={section.id} value={section.id}>
                    {section.name}
                  </MemoizedMenuItem>
                ))}
              </MemoizedSelect>
            </Grid>
            <Grid item xs={12}>
              <MemoizedSelect
                name="courses_ids"
                value={form.courses_ids}
                onChange={handleCoursesChange}
                label="Courses"
                multiple
                disabled={loading || !form.section_id}
                error={formErrors.courses_ids}
                helperText={formErrors.courses_ids}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.23)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.38)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main'
                    },
                    '&.Mui-error fieldset': {
                      borderColor: '#d32f2f'
                    }
                  },
                  mb: formErrors.courses_ids ? 0.5 : 2
                }}
              >
                {data.courses.map(course => (
                  <MemoizedMenuItem key={course.id} value={course.id}>
                    {course.name}
                  </MemoizedMenuItem>
                ))}
              </MemoizedSelect>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
            disabled={loading}
            onClick={handleSubmit}
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              minWidth: 120,
              '& .MuiButton-startIcon': {
                marginRight: 1
              },
              '&:hover': {
                backgroundColor: 'primary.dark',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              },
              '&:active': {
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              },
              '&:disabled': {
                backgroundColor: 'action.disabledBackground',
                color: 'action.disabled'
              }
            }}
          >
            {loading ? 'Saving...' : (isEditMode ? 'Update Student' : 'Register Student')}
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleBackClick}
            disabled={loading}
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              minWidth: 120,
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
