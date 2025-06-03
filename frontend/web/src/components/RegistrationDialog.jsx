import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import useApi from '../hooks/useApi';
import { getCookie } from '../services/axiosConfig';

const RegistrationDialog = ({ open: dialogOpen, onClose, onSuccess }) => {
  const { post, loading, error } = useApi();
  const isMounted = useRef(true);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    student_id: '',
    phone: ''
  });

  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set up cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Auto-generate student ID when component mounts
  useEffect(() => {
    const generateStudentId = () => {
      const year = new Date().getFullYear().toString().slice(-2);
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      return `STU${year}${randomNum}`;
    };
    
    setFormData(prev => ({
      ...prev,
      student_id: generateStudentId()
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.first_name || !formData.last_name) {
      setFormError('Please enter your full name');
      return false;
    }
    if (!formData.email) {
      setFormError('Email is required');
      return false;
    }
    if (!formData.phone) {
      setFormError('Phone number is required');
      return false;
    }
    return true;
  };

  // Function to ensure we have a CSRF token before making the request
  const ensureCsrfToken = useCallback(async () => {
    try {
      // Get the base URL from environment or use default
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      // First try to get the CSRF token from cookies
      let csrfToken = getCookie('csrftoken');
      
      if (!csrfToken) {
        console.log('No CSRF token found in cookies, fetching new one...');
        
        // Make sure to use the full URL with the base URL
        const response = await axios.get(`${baseURL}/api/csrf/`, { 
          withCredentials: true,
          headers: {
            'Accept': 'application/json'
          },
          // Don't include credentials for the CSRF request
          withCredentials: true
        });
        
        // Get the CSRF token from the response cookies
        csrfToken = getCookie('csrftoken');
        console.log('CSRF token obtained from server:', csrfToken ? '***' + csrfToken.slice(-8) : 'Not found');
        
        if (!csrfToken) {
          console.warn('CSRF token not found in cookies after fetching');
          // Try to get it from the response headers as a fallback
          const setCookieHeader = response.headers['set-cookie'];
          if (setCookieHeader) {
            const csrfCookie = setCookieHeader.find(c => c.includes('csrftoken='));
            if (csrfCookie) {
              const match = csrfCookie.match(/csrftoken=([^;]+)/);
              if (match && match[1]) {
                csrfToken = match[1];
                console.log('Extracted CSRF token from response headers');
              }
            }
          }
        }
      } else {
        console.log('Using existing CSRF token from cookies');
      }
      
      if (!csrfToken) {
        console.warn('Failed to obtain CSRF token');
      }
      
      return csrfToken;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      // Don't throw an error here, as the server might still accept the request
      // without a CSRF token if it's not required for this endpoint
      return null;
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started');
    setFormError('');
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Starting form submission');
    setIsSubmitting(true);
    
    try {
      // Ensure we have a CSRF token before proceeding
      const csrfToken = await ensureCsrfToken();
      console.log('CSRF token for request:', csrfToken ? '***' + csrfToken.slice(-8) : 'Not found');

      // Prepare the registration data
      const registrationData = {
        name: `${formData.first_name.trim()} ${formData.last_name.trim()}`,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: 'student',
        student_id: formData.student_id,
        message: 'New student registration request from landing page'
      };

      console.log('Sending request to /api/registration-request/ with payload:', registrationData);

      // Get the base URL from environment or use default
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      // Make the request directly with axios to avoid any potential issues with the useApi hook
      const response = await axios.post(
        `${baseURL}/api/registration-request/`,
        registrationData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(csrfToken && { 'X-CSRFToken': csrfToken })
          },
          // Add timeout to prevent hanging
          timeout: 30000
        }
      );
      
      console.log('Received response:', response);
      
      // Handle successful response
      if (response && response.status >= 200 && response.status < 300) {
        console.log('Registration successful, response data:', response.data);
        setSuccess(true);
        setFormError('');
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(response.data);
        }
        
        // Reset form after successful submission
        setTimeout(() => {
          if (isMounted.current) {
            handleClose();
          }
        }, 2000);
      } else {
        console.error('Unexpected response status:', response.status);
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      
      // Handle different types of errors
      if (error.response?.data) {
        // Handle validation errors
        if (error.response.data.error) {
          setFormError(error.response.data.error);
        } 
        // Handle field-specific errors
        else if (typeof error.response.data === 'object') {
          const errorMessages = [];
          for (const [field, messages] of Object.entries(error.response.data)) {
            errorMessages.push(`${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`);
          }
          setFormError(errorMessages.join('\n'));
        } else {
          setFormError(error.response.data.detail || JSON.stringify(error.response.data));
        }
      } else {
        setFormError(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      console.log('Form submission completed');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Prevent closing while submitting
    if (isSubmitting) {
      return;
    }
    
    // Only reset the form if submission was not successful
    if (!success) {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        student_id: '',
        phone: ''
      });
      setFormError('');
    }
    
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog 
      open={dialogOpen} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={isSubmitting}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Student Registration</Typography>
          <IconButton 
            onClick={handleClose} 
            disabled={isSubmitting}
            edge="end"
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}
        {success ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="success.main" gutterBottom>
              Registration Successful!
            </Typography>
            <Typography variant="body1">
              Thank you for your registration. We will contact you soon.
            </Typography>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Box mb={2}>
              <TextField
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                disabled={isSubmitting}
              />
              <TextField
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                disabled={isSubmitting}
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                disabled={isSubmitting}
              />
              <TextField
                label="Student ID"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                fullWidth
                margin="normal"
                disabled
              />
              <TextField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                disabled={isSubmitting}
              />
            </Box>
          </form>
        )}
      </DialogContent>
      {!success && (
        <DialogActions>
          <Button 
            onClick={handleClose} 
            disabled={isSubmitting}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 2 }}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Registration Request'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default RegistrationDialog;
