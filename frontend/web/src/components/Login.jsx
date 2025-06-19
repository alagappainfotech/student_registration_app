import React, { useState, useEffect, useCallback } from 'react';

// Material-UI Components
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Avatar,
  Alert,
  CircularProgress,
  IconButton,
  Link
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

// Routing
import { useNavigate, useLocation } from 'react-router-dom';

// Authentication
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';
import axiosInstance, { getCookie, setAuthHeader } from '../services/axiosConfig';
import { Logger, ErrorAnalyzer } from '../utils/errorHandler';

// Custom error types for more granular error handling
class LoginValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'LoginValidationError';
  }
}

class TokenRefreshError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TokenRefreshError';
  }
}

// Login component

// Get dashboard route based on user role
const getUserDashboardRoute = (role) => {
  console.log('Determining dashboard route for role:', role);

  if (!role) {
    console.warn('No role provided, defaulting to student dashboard');
    return '/student';
  }

  const normalizedRole = role.toString().toLowerCase().trim();

  switch (normalizedRole) {
    case 'faculty':
    case 'teacher':
    case 'instructor':
      console.log('Redirecting to faculty dashboard');
      return '/faculty';

    case 'student':
    case 'learner':
      console.log('Redirecting to student dashboard');
      return '/student';

    case 'admin':
    case 'administrator':
    case 'superuser':
      console.log('Redirecting to admin dashboard');
      return '/admin';

    default:
      console.warn(`Unknown role '${role}', defaulting to student dashboard`);
      return '/student';
  }
};

const Login = () => {
  // Validate login form inputs
  const validateLoginInputs = useCallback((username, password) => {
    const errors = {};

    if (!username) {
      errors.username = 'Username is required';
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    return errors;
  }, []);
  // Navigation and Location Hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Auth Context
  const { setUser } = useAuth();

  // State Management
  const [loginState, setLoginState] = useState({
    username: '',
    password: '',
    error: '',
    isLoading: false,
    showPassword: false,
    formErrors: {}
  });

  // Form Handlers
  const handleChange = useCallback((e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    const { name, value } = e.target;
    setLoginState(prev => ({
      ...prev,
      [name]: value,
      error: '', // Clear any existing error when user types
      formErrors: {
        ...prev.formErrors,
        [name]: ''
      }
    }));
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setLoginState(prev => ({ ...prev, showPassword: !prev.showPassword }));
  }, []);

  // Form validation
  const validateForm = useCallback(() => {
    const errors = {};
    let isValid = true;

    if (!loginState.username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    }

    if (!loginState.password) {
      errors.password = 'Password is required';
      isValid = false;
    }

    setLoginState(prev => ({
      ...prev,
      formErrors: errors
    }));

    return isValid;
  }, [loginState.username, loginState.password]);

  // Login Handler
  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();

      // Clear any previous errors
      setLoginState(prev => ({ ...prev, error: '' }));

      // Validate form
      if (!validateForm()) {
        return;
      }

      // Set loading state
      setLoginState(prev => ({ ...prev, isLoading: true }));

      // Make login request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        // Get CSRF token
        console.log('Fetching CSRF token...');
        await axiosInstance.get('/api/csrf/');

        // Prepare login data
        const loginData = {
          email: loginState.username,  // Use email as username
          password: loginState.password
        };
        console.log('Login request data:', loginData);

        // Make login request
        const response = await axiosInstance.post('/api/login/', loginData, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
          },
          withCredentials: true,
          validateStatus: status => status < 500 // Don't throw for 4xx errors
        });

        // Handle 401 Unauthorized
        if (response.status === 401) {
          throw new Error('Invalid email or password. Please try again.');
        }

        // Log the response for debugging
        console.log('Login response status:', response.status);
        console.log('Login response headers:', response.headers);
        console.log('Login response data:', response.data);

        // Process the response
        if (!response.data) {
          throw new Error('No data in response');
        }

        // Handle the response format from our backend
        let accessToken, refreshToken, userRole, userData = {};

        // Handle different response formats
        if (response.data.tokens?.access) {
          // Format: {tokens: {access, refresh}, user: {...}}
          accessToken = response.data.tokens.access;
          refreshToken = response.data.tokens.refresh || '';
          userRole = response.data.user?.role || 'student';
          userData = response.data.user || {};
          console.log('Using standard format (tokens.access)');
        }
        // Fallback to other formats for backward compatibility
        else if (response.data.access_token) {
          // Format: {access_token, refresh_token, user, userRole}
          accessToken = response.data.access_token;
          refreshToken = response.data.refresh_token || '';
          userRole = response.data.userRole || 'student';
          userData = response.data.user || {};
          console.log('Using underscore format (access_token)');
        } else if (response.data.access && response.data.refresh) {
          // Format: {access, refresh, userRole, user}
          accessToken = response.data.access;
          refreshToken = response.data.refresh;
          userRole = response.data.userRole || 'student';
          userData = response.data.user || {};
          console.log('Using standard format (access/refresh)');
        } else if (response.data.token) {
          // Format: {token, refresh_token, user, userRole}
          accessToken = response.data.token;
          refreshToken = response.data.refresh_token || '';
          userRole = response.data.userRole || 'student';
          userData = response.data.user || {};
          console.log('Using single token format');
        } else {
          console.error('Unexpected response format. Available keys:', Object.keys(response.data));
          throw new Error('Invalid response format from server');
        }

        if (!accessToken) {
          throw new Error('No access token received from server');
        }

        // Store tokens
        localStorage.setItem('access_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }

        // Set auth header for future requests
        setAuthHeader(accessToken);

        // Update user context
        setUser({
          ...userData,
          isAuthenticated: true,
          token: accessToken,
          role: userRole
        });

        // Store user role in localStorage for persistence
        localStorage.setItem('user_role', userRole);
        console.log('User authenticated successfully. Role:', userRole);

        // Navigate to appropriate dashboard
        const dashboardRoute = getUserDashboardRoute(userRole);
        console.log('Navigation: Redirecting to', dashboardRoute);

        // Small delay to ensure state is updated before navigation
        setTimeout(() => {
          navigate(dashboardRoute, { replace: true });
        }, 100);

        return response;

      } catch (error) {
        // Clean up timeout if it exists
        if (timeoutId) clearTimeout(timeoutId);

        console.error('Login error:', error);

        // Handle different types of errors
        let errorMessage = 'Login failed. Please try again.';

        if (error.response) {
          // Server responded with an error status code
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);

          if (error.response.status === 401) {
            errorMessage = 'Invalid email or password. Please try again.';
          } else if (error.response.data?.detail) {
            errorMessage = error.response.data.detail;
          }
        } else if (error.request) {
          // Request was made but no response received
          console.error('No response received:', error.request);
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (error.name === 'AbortError') {
          // Request was aborted due to timeout
          errorMessage = 'Request timed out. Please check your internet connection and try again.';
        } else {
          // Other errors
          errorMessage = error.message || 'An unexpected error occurred.';
        }

        // Update state with error message
        setLoginState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage
        }));

        return null;
      }
    },
    [loginState.username, loginState.password, navigate, setUser, validateForm, getUserDashboardRoute]
  );

  // Setup request interceptor to add auth token
  const setupTokenInterceptor = useCallback(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle token refresh on 401 responses
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 401) {
          // Handle token refresh or redirect to login
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    // Return cleanup function
    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate]);

  // Only setup token interceptor when user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const cleanup = setupTokenInterceptor();
      return () => cleanup();
    }
  }, [setupTokenInterceptor]);

  // Add a test function to check button click
  const handleButtonClick = (e) => {
    console.log('Button clicked');
    console.log('Form state:', loginState);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: { xs: 2, sm: 4, md: 8 }, // Responsive padding
        '&:before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: -1,
          opacity: 0.1,
          backgroundImage: 'url("/background-pattern.png")',
        }
      }}
    >
      <Box
        sx={{
          maxWidth: 450,
          width: '100%',
          mx: 'auto' // Center horizontally
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 }, // Responsive padding
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0 8px 16px -2px rgba(0, 0, 0, 0.1), 0 4px 8px -2px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 20px -2px rgba(0, 0, 0, 0.12), 0 8px 12px -2px rgba(0, 0, 0, 0.08)'
            }
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{
                m: 1,
                bgcolor: 'primary.main',
                width: 70,
                height: 70,
                boxShadow: '0 8px 16px -4px rgba(25, 118, 210, 0.3), 0 4px 8px -4px rgba(25, 118, 210, 0.2)',
                mb: 2
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Typography
              component="h1"
              variant="h4"
              sx={{
                textAlign: 'center',
                fontWeight: 700,
                color: 'text.primary',
                letterSpacing: '-0.01em'
              }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                textAlign: 'center',
                mt: 1,
                mb: 3,
                opacity: 0.8,
                maxWidth: '85%',
                mx: 'auto'
              }}
            >
              Please sign in to continue
            </Typography>
          </Box>

          <Box sx={{
            minHeight: loginState.error ? 'auto' : 0,
            overflow: 'hidden',
            transition: 'min-height 0.3s ease-in-out',
            mb: loginState.error ? 2 : 0
          }}>
            {loginState.error && (
              <Alert
                severity="error"
                onClose={() => setLoginState(prev => ({ ...prev, error: '' }))}
                sx={{
                  borderRadius: 1,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  '& .MuiAlert-message': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  },
                  '& .MuiAlert-action': {
                    p: 0,
                    alignItems: 'center',
                    mr: 0.5
                  }
                }}
              >
                {loginState.error}
              </Alert>
            )}
          </Box>

          <Box
            component="form"
            onSubmit={(e) => {
  e.preventDefault();
  handleLogin(e);
}}
            noValidate
            autoComplete="off"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
              width: '100%',
              position: 'relative',
              '& .MuiTextField-root': {
                backgroundColor: 'background.paper',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                },
              },
            }}
          >
            <Box>
              <TextField
                margin="none"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={loginState.username}
                onChange={handleChange}
                variant="outlined"
                error={!!loginState.formErrors.username}
                helperText={loginState.formErrors.username || ' '}
                sx={{
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    height: 56,
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.23)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.38)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: '1px !important'
                    },
                    '&.Mui-error fieldset': {
                      borderColor: '#d32f2f'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.95rem',
                    '&.Mui-focused': {
                      color: 'primary.main'
                    }
                  },
                  '& .MuiFormHelperText-root': {
                    marginLeft: 0,
                    marginTop: '3px',
                    fontSize: '0.75rem',
                    lineHeight: 1.2,
                    color: loginState.formErrors.username ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)'
                  }
                }}
              />
            </Box>

            <Box>
              <TextField
                margin="none"
                required
                fullWidth
                name="password"
                label="Password"
                type={loginState.showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={loginState.password}
                onChange={handleChange}
                variant="outlined"
                error={!!loginState.formErrors.password}
                helperText={loginState.formErrors.password || ' '}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        togglePasswordVisibility();
                      }}
                      edge="end"
                      aria-label="toggle password visibility"
                      size="medium"
                    >
                      {loginState.showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  )
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    height: 56,
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.23)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.38)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: '1px !important'
                    },
                    '&.Mui-error fieldset': {
                      borderColor: '#d32f2f'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.95rem',
                    '&.Mui-focused': {
                      color: 'primary.main'
                    }
                  },
                  '& .MuiFormHelperText-root': {
                    marginLeft: 0,
                    marginTop: '3px',
                    fontSize: '0.75rem',
                    lineHeight: 1.2,
                    color: loginState.formErrors.password ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)'
                  }
                }}
              />
            </Box>

            <Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={loginState.isLoading}
                sx={{
                  mt: 2,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 1.5,
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'rgba(0, 0, 0, 0.12)',
                    color: 'rgba(0, 0, 0, 0.26)'
                  }
                }}
              >
                {loginState.isLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                    <CircularProgress size={22} color="inherit" thickness={4} />
                    <Typography variant="button" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      Signing In...
                    </Typography>
                  </Box>
                ) : (
                  'Sign In'
                )}
              </Button>
            </Box>
          </Box>


          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 3.5,
              mb: 1
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
              Need help?{' '}
              <Link
                href="#"
                underline="hover"
                color="primary"
                sx={{
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Contact Support
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
