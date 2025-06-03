import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Button, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, CircularProgress, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, Divider, Chip, Snackbar,
  Tooltip
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import useApi from '../hooks/useApi';
import { AuthUtils } from '../services/axiosConfig';

// Custom Alert component for snackbar
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  // Initialize the useApi hook
  const { get, post, put, loading: apiLoading, error: apiError } = useApi();
  
  // Component state
  const [dashboardData, setDashboardData] = useState({
    users: { total: 0, active: 0, inactive: 0, faculty: 0 },
    courses: { total: 0, active: 0, upcoming: 0, completed: 0 },
    courseDetails: [],
    loading: true,
    error: null
  });
  const [registrationRequests, setRegistrationRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending'); // Add status filter state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState('');
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Function to handle token refresh
  const refreshToken = useCallback(async () => {
    try {
      console.log('Attempting to refresh token...');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        console.error('No refresh token available');
        throw new Error('No refresh token available');
      }
      
      console.log('Sending refresh token request...');
      
      // Use the useApi hook to refresh the token
      const response = await post('/api/token/refresh/', { refresh: refreshToken });
      
      console.log('Refresh token response:', response);
      
      if (!response.data || !response.data.access) {
        throw new Error('No access token in response');
      }
      
      const { access, refresh: newRefreshToken } = response.data;
      
      console.log('New tokens received:', {
        access_token: access ? '***' + access.slice(-8) : 'none',
        refresh_token: newRefreshToken ? '***' + newRefreshToken.slice(-8) : 'none'
      });
      
      // Update tokens in localStorage
      localStorage.setItem('access_token', access);
      
      // Update refresh token if a new one was provided
      if (newRefreshToken) {
        localStorage.setItem('refresh_token', newRefreshToken);
      }
      
      return access;
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // Clear tokens and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Show error message
      setSnackbar({
        open: true,
        message: 'Your session has expired. Please log in again.',
        severity: 'error',
      });
      
      // Redirect to login page
      navigate('/login', { replace: true });
      throw error;
    }
  }, [navigate, post]);

  // Fetch registration requests
  const fetchRegistrationRequests = useCallback(async (retry = true) => {
    console.log('Fetching registration requests with status filter:', statusFilter);
    
    try {
      setLoadingRequests(true);
      setError(null);
      
      // Build the URL with the status filter if it's not 'all'
      const url = statusFilter === 'all' 
        ? '/api/registration-requests/' 
        : `/api/registration-requests/?status=${statusFilter}`;
      
      console.log('Making API request to:', url);
      
      // Get the current token for debugging
      const token = localStorage.getItem('access_token');
      console.log('Current auth token:', token ? `***${token.slice(-8)}` : 'No token found');
      
      const response = await get(url);
      
      console.log('API response received:', response);
      
      if (response && response.data) {
        // Transform the data to match the expected format for the DataGrid
        const formattedData = response.data.map(request => ({
          id: request.id,
          student_name: `${request.first_name} ${request.last_name}`,
          email: request.email,
          phone_number: request.phone_number || 'N/A',
          status: request.status || 'pending',
          created_at: new Date(request.created_at).toLocaleString(),
          // Include all the original data as well for the detail view
          ...request
        }));
        
        console.log('Formatted data:', formattedData);
        setRegistrationRequests(formattedData);
        return formattedData;
      } else {
        console.warn('No data in response:', response);
        setRegistrationRequests([]);
        setError('No registration requests found.');
        return [];
      }
    } catch (error) {
      console.error('Error fetching registration requests:', error);
      
      // Log the complete error object for debugging
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        stack: error.stack
      });
      
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          if (retry) {
            console.log('Token might be expired, attempting refresh...');
            try {
              await refreshToken();
              // Retry the request once with the new token
              return fetchRegistrationRequests(false);
            } catch (refreshError) {
              console.error('Failed to refresh token:', refreshError);
              setError('Your session has expired. Please log in again.');
              // Show error to user
              setSnackbar({
                open: true,
                message: 'Your session has expired. Please log in again.',
                severity: 'error',
              });
              // Redirect to login
              navigate('/login');
            }
          } else {
            setError('Your session has expired. Please log in again.');
            setSnackbar({
              open: true,
              message: 'Your session has expired. Please log in again.',
              severity: 'error',
            });
            navigate('/login');
          }
        } else if (error.response.status === 403) {
          const errorMessage = 'You do not have permission to view registration requests. Please contact an administrator.';
          setError(errorMessage);
          setSnackbar({
            open: true,
            message: errorMessage,
            severity: 'error',
          });
        } else if (error.response.status === 404) {
          const errorMessage = 'The requested resource was not found.';
          setError(errorMessage);
          setSnackbar({
            open: true,
            message: errorMessage,
            severity: 'error',
          });
        } else {
          const errorMessage = error.response.data?.detail || 
                             error.response.data?.message || 
                             error.response.statusText || 
                             'Request failed';
          setError(errorMessage);
          setSnackbar({
            open: true,
            message: errorMessage,
            severity: 'error',
          });
        }
      } else if (error.request) {
        // The request was made but no response was received
        const errorMessage = 'No response from server. Please check your internet connection.';
        console.error('No response received:', error.request);
        setError(errorMessage);
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
      } else {
        // Something happened in setting up the request
        const errorMessage = `Error: ${error.message}`;
        setError(errorMessage);
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
      }
      
      setRegistrationRequests([]);
      return [];
    } finally {
      setLoadingRequests(false);
    }
  }, [get, navigate, refreshToken]);

  // Helper function to get cookie by name
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  // Handle approve/reject actions
  const handleApproveReject = async (requestId, action, retry = true) => {
    try {
      setActionLoading(true);
      
      // Log the current authentication state
      console.log('Current auth state:', {
        isAuthenticated: AuthUtils.isAuthenticated(),
        accessToken: AuthUtils.getAccessToken() ? '***' : 'none',
        refreshToken: AuthUtils.getRefreshToken() ? '***' : 'none'
      });
      
      // Ensure we have a CSRF token
      let csrfToken = getCookie('csrftoken');
      if (!csrfToken) {
        console.log('No CSRF token found, fetching a new one...');
        try {
          const csrfResponse = await fetch('/api/csrf/', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
            },
          });
          
          if (!csrfResponse.ok) {
            throw new Error(`Failed to get CSRF token: ${csrfResponse.status}`);
          }
          
          csrfToken = getCookie('csrftoken');
          console.log('New CSRF token obtained');
        } catch (csrfError) {
          console.error('Failed to get CSRF token:', csrfError);
          throw new Error('Failed to initialize security token. Please refresh the page and try again.');
        }
      } else {
        console.log('Using existing CSRF token');
      }
      
      // Prepare headers with CSRF token and auth
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }
      
      // Get the access token
      const accessToken = AuthUtils.getAccessToken();
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      // Use the correct endpoint format for the backend
      const endpoint = `/api/registration-requests/${requestId}/${action === 'approve' ? 'approve' : 'reject'}/`;
      
      // Include empty object for approve, include reason for reject
      const requestData = action === 'reject' ? { reason: 'Rejected by admin' } : {};
      
      console.log(`Making ${action} request to:`, endpoint);
      console.log('Request data:', requestData);
      console.log('Request headers:', headers);
      
      // Make the request using fetch with credentials
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: headers,
        body: JSON.stringify(requestData)
      });
      
      console.log('Response status:', response.status);
      
      let responseData;
      try {
        responseData = await response.json();
        console.log('Response data:', responseData);
      } catch (e) {
        console.error('Failed to parse response as JSON');
        throw new Error('Invalid response format from server');
      }
      
      if (!response.ok) {
        throw new Error(responseData.detail || responseData.error || `Request failed with status ${response.status}`);
      }
      
      if (!responseData) {
        throw new Error('Empty response from server');
      }
      
      // Show success message with student ID if approved
      let message = `Request ${action}ed successfully`;
      if (action === 'approve' && responseData.student_id) {
        message += `. Student ID: ${responseData.student_id}`;
      }
      
      // Refresh the requests list
      await fetchRegistrationRequests();
      
      // Close the dialog if open
      if (selectedRequest?.id === requestId) {
        setOpenDialog(false);
      }
      
      // Show success message
      setSnackbar({
        open: true,
        message: message,
        severity: 'success',
        autoHideDuration: 10000 // Show for 10 seconds
      });
      
      // Return the response data for further processing if needed
      return responseData;
    } catch (error) {
      console.error(`Failed to ${action} request:`, error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      
      // Handle 401 Unauthorized (token expired)
      if (error.message?.includes('401') || error.response?.status === 401) {
        if (retry) {
          try {
            console.log('Token might be expired, attempting to refresh...');
            await refreshToken();
            // Retry the request once with the new token
            return handleApproveReject(requestId, action, false);
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Fall through to show error message
          }
        }
      }
      
      // Handle 403 Forbidden (user doesn't have permission)
      if (error.message?.includes('403') || error.response?.status === 403) {
        setSnackbar({
          open: true,
          message: 'You do not have permission to perform this action. Please log in again.',
          severity: 'error',
          autoHideDuration: 10000
        });
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      // Handle CSRF token errors
      if (error.response?.data?.detail?.includes('CSRF') || 
          error.response?.data?.error?.includes('CSRF') ||
          error.message?.includes('CSRF')) {
        setSnackbar({
          open: true,
          message: 'Session expired. Please refresh the page and try again.',
          severity: 'error',
          autoHideDuration: 10000
        });
        return;
      }
      
      // Handle other errors
      const errorMessage = error.response?.data?.error || 
                         error.response?.data?.detail || 
                         error.message || 
                         `Failed to ${action} request`;
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
        autoHideDuration: 10000
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm approve/reject action
  const confirmAction = async () => {
    if (!selectedRequest) return;
    
    setActionLoading(true);
    try {
      const endpoint = `/api/registration-requests/${selectedRequest.id}/${action}/`;
      
      // Get the current token
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      // Make the request with the token in the headers
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-CSRFToken': getCookie('csrftoken') || '',
        },
        credentials: 'include',
        body: JSON.stringify({})
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.detail || 'Failed to process request');
      }
      
      // Show success message with student ID if approved
      let message = `Request ${action}ed successfully`;
      if (action === 'approve' && response.data.student_id) {
        message += `. Student ID: ${response.data.student_id}`;
      }
      
      // Refresh the requests list
      await fetchRegistrationRequests();
      
      // Close the dialog if open
      setOpenDialog(false);
      
      setSnackbar({
        open: true,
        message: message,
        severity: 'success'
      });
    } catch (error) {
      console.error(`Failed to ${action} request:`, error);
      
      // Handle 401 Unauthorized (token expired)
      if (error.response?.status === 401) {
        setSnackbar({
          open: true,
          message: 'Your session has expired. Please log in again.',
          severity: 'error'
        });
        navigate('/login');
      } else {
        setSnackbar({
          open: true,
          message: `Failed to ${action} request: ${error.response?.data?.detail || error.message || 'Unknown error'}`,
          severity: 'error'
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle view details
  const handleViewDetails = (request) => {
    setSelectedRequest({
      ...request,
      created_at: new Date(request.created_at).toLocaleString(),
      processed_at: request.processed_at ? new Date(request.processed_at).toLocaleString() : 'N/A'
    });
    setOpenDialog(true);
  };

  // Fetch dashboard data on component mount
  const fetchDashboardData = useCallback(async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch dashboard data from the admin dashboard endpoint
      const dashboardRes = await get('/api/dashboard/admin/');
      
      // Check if the request was aborted
      if (dashboardRes?.isCanceled) {
        return;
      }
      
      // Fetch courses separately
      const coursesRes = await get('/api/courses/');
      
      // Check if the request was aborted
      if (coursesRes?.isCanceled) {
        return;
      }
      
      // Check if we have data
      if (!dashboardRes.data || !coursesRes.data) {
        throw new Error('Failed to load dashboard data');
      }

      // Process the dashboard data to match the expected format
      const usersData = {
        students: dashboardRes.data.users?.students || 0,
        faculty: dashboardRes.data.users?.faculty || 0,
        // For backward compatibility
        total: (dashboardRes.data.users?.students || 0) + (dashboardRes.data.users?.faculty || 0)
      };
      
      // Process courses data
      const coursesData = {
        total: dashboardRes.data.courses?.total || 0,
        totalFees: dashboardRes.data.courses?.totalFees || 0,
        // For backward compatibility
        active: dashboardRes.data.courses?.total || 0
      };
      
      setDashboardData({
        users: usersData,
        courses: coursesData,
        courseDetails: Array.isArray(coursesRes.data) ? coursesRes.data : [],
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setDashboardData(prev => ({
        ...prev,
        error: error?.message || 'Failed to load dashboard data',
        loading: false
      }));
      setSnackbar({
        open: true,
        message: error?.message || 'Failed to load dashboard data',
        severity: 'error'
      });
    }
  }, [get]);

  // Fetch registration requests when status filter changes
  useEffect(() => {
    fetchRegistrationRequests();
  }, [fetchRegistrationRequests, statusFilter]); // Add statusFilter to dependencies
  
  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Navigation handlers
  const handleManageFaculty = () => navigate('/faculties');
  const handleManageStudents = () => navigate('/students');
  const handleManageCourses = () => navigate('/courses');

  // Render loading state
  if (dashboardData.loading || loadingRequests) {
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

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', p: { xs: 2, sm: 3 } }}>
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
      
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleManageFaculty}
                fullWidth
              >
                Manage Faculty
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleManageStudents}
                fullWidth
              >
                Manage Students
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleManageCourses}
                fullWidth
              >
                Manage Courses
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Statistics */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                  Total Students
                </Typography>
                <Typography variant="h4">
                  {dashboardData.users?.students?.toLocaleString() || '0'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                  Total Faculty
                </Typography>
                <Typography variant="h4">
                  {dashboardData.users?.faculty?.toLocaleString() || '0'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                  Total Courses
                </Typography>
                <Typography variant="h4">
                  {dashboardData.courses?.total?.toLocaleString() || '0'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                  Total Fees
                </Typography>
                <Typography variant="h4">
                  ${dashboardData.courses?.totalFees?.toLocaleString() || '0'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Registration Requests */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, boxShadow: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, mb: 3, gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'medium' }}>Registration Requests</Typography>
              <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
                <TextField
                  select
                  size="small"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  variant="outlined"
                  label="Filter by status"
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="all">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'text.secondary' }} />
                      All Requests
                    </Box>
                  </MenuItem>
                  <MenuItem value="pending">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                      Pending
                    </Box>
                  </MenuItem>
                  <MenuItem value="approved">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                      Approved
                    </Box>
                  </MenuItem>
                  <MenuItem value="rejected">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
                      Rejected
                    </Box>
                  </MenuItem>
                </TextField>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={fetchRegistrationRequests}
                  disabled={loadingRequests}
                  startIcon={loadingRequests ? <CircularProgress size={16} /> : <RefreshIcon />}
                >
                  Refresh
                </Button>
              </Box>
            </Box>
            
            <TableContainer sx={{ maxHeight: 500, overflow: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Requested On</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingRequests ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : registrationRequests.length > 0 ? (
                    registrationRequests.map((request) => (
                      <TableRow 
                        key={request.id}
                        hover
                        sx={{ 
                          '&:hover': { cursor: 'pointer' },
                          opacity: request.status !== 'pending' ? 0.8 : 1
                        }}
                        onClick={() => handleViewDetails(request)}
                      >
                        <TableCell>{request.name}</TableCell>
                        <TableCell>{request.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={request.role === 'student' ? 'Student' : 'Faculty'}
                            size="small"
                            variant="outlined"
                            color={request.role === 'student' ? 'primary' : 'secondary'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={request.status}
                            color={
                              request.status === 'approved' ? 'success' : 
                              request.status === 'rejected' ? 'error' : 'warning'
                            }
                            size="small"
                            variant={request.status === 'pending' ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={new Date(request.created_at).toLocaleString()}>
                            <span>{new Date(request.created_at).toLocaleDateString()}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            {request.status === 'pending' && (
                              <>
                                <Tooltip title="Approve">
                                  <IconButton 
                                    color="success" 
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApproveReject(request.id, 'approve');
                                    }}
                                    disabled={actionLoading}
                                  >
                                    <CheckCircleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <IconButton 
                                    color="error" 
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApproveReject(request.id, 'reject');
                                    }}
                                    disabled={actionLoading}
                                  >
                                    <CancelIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(request);
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No {statusFilter} registration requests found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Request Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedRequest && (
          <>
            <DialogTitle>Registration Request Details</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2, mb: 3 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  <strong>Requested on:</strong> {selectedRequest?.created_at}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  <strong>Status:</strong> 
                  <Chip 
                    label={selectedRequest?.status.toUpperCase()} 
                    color={
                      selectedRequest?.status === 'approved' ? 'success' : 
                      selectedRequest?.status === 'rejected' ? 'error' : 'warning'
                    } 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                </Typography>
                {selectedRequest?.processed_at && (
                  <Typography variant="subtitle1" color="text.secondary">
                    <strong>Processed on:</strong> {selectedRequest.processed_at}
                  </Typography>
                )}
                {selectedRequest?.processed_by && (
                  <Typography variant="subtitle1" color="text.secondary">
                    <strong>Processed by:</strong> {selectedRequest.processed_by}
                  </Typography>
                )}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>Applicant Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                  <Typography variant="body1" gutterBottom>{selectedRequest?.name || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Email Address</Typography>
                  <Typography variant="body1" gutterBottom>
                    <a href={`mailto:${selectedRequest?.email}`} style={{ textDecoration: 'none' }}>
                      {selectedRequest?.email || 'N/A'}
                    </a>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Phone Number</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRequest?.phone ? (
                      <a href={`tel:${selectedRequest.phone}`} style={{ textDecoration: 'none' }}>
                        {selectedRequest.phone}
                      </a>
                    ) : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Requested Role</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRequest?.role ? (
                      <Chip 
                        label={selectedRequest.role.toUpperCase()} 
                        color="primary"
                        size="small"
                      />
                    ) : 'N/A'}
                  </Typography>
                </Grid>
                {selectedRequest?.message && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Additional Message</Typography>
                    <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'background.paper' }}>
                      <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                        {selectedRequest.message || 'No message provided.'}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
              <Box sx={{ mb: 2, mt: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">Message</Typography>
                <Typography sx={{ 
                  p: 2, 
                  bgcolor: 'action.hover', 
                  borderRadius: 1,
                  whiteSpace: 'pre-wrap',
                  fontStyle: selectedRequest.message ? 'inherit' : 'italic'
                }}>
                  {selectedRequest.message || 'No additional message provided.'}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
              <Box>
                {selectedRequest.status === 'pending' && (
                  <Button 
                    color="error" 
                    variant="outlined"
                    onClick={() => handleApproveReject(selectedRequest.id, 'reject')}
                    disabled={actionLoading}
                    startIcon={<CancelIcon />}
                    sx={{ mr: 1 }}
                  >
                    Reject Request
                  </Button>
                )}
              </Box>
              <Box>
                <Button 
                  onClick={() => setOpenDialog(false)}
                  color="primary"
                >
                  Close
                </Button>
                {selectedRequest.status === 'pending' && (
                  <Button 
                    color="primary" 
                    variant="contained"
                    onClick={() => handleApproveReject(selectedRequest.id, 'approve')}
                    disabled={actionLoading}
                    startIcon={<CheckCircleIcon />}
                  >
                    Approve Request
                  </Button>
                )}
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
