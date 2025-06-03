import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { Snackbar, Alert, CircularProgress, Typography } from '@mui/material';
import theme from './theme';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from './services/axiosConfig';
import useApi from './hooks/useApi';

// Lazy load components for better performance
const StudentRegistrationForm = React.lazy(() => import('./components/StudentRegistrationForm'));
const StudentList = React.lazy(() => import('./components/StudentList'));
const FacultyList = React.lazy(() => import('./components/FacultyList'));
const CourseList = React.lazy(() => import('./components/CourseList'));
const FacultyDashboard = React.lazy(() => import('./components/FacultyDashboard'));
const Login = React.lazy(() => import('./components/Login'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const StudentDashboard = React.lazy(() => import('./components/StudentDashboard'));
const PasswordResetRequest = React.lazy(() => import('./components/PasswordResetRequest'));
const PasswordResetConfirm = React.lazy(() => import('./components/PasswordResetConfirm'));
const LandingPage = React.lazy(() => import('./components/LandingPage'));
const AboutUs = React.lazy(() => import('./components/AboutUs'));

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { get, post } = useApi();

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      const storedUserRole = localStorage.getItem('user_role');

      // Immediate checks
      if (!token || !storedUser) {
        navigate('/login', { state: { from: location }, replace: true });
        return;
      }

      try {
        // Verify token is valid
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          // Token expired, try to refresh
          try {
            const response = await post('/api/token/refresh/', {
              refresh: localStorage.getItem('refresh_token')
            });
            
            localStorage.setItem('access_token', response.access);
            // Continue with the request
          } catch (refreshError) {
            // Refresh token failed, redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            localStorage.removeItem('user_role');
            navigate('/login', { state: { from: location }, replace: true });
            return;
          }
        }

        // Check user role
        if (allowedRoles && !allowedRoles.includes(storedUserRole)) {
          // Redirect to appropriate dashboard based on role
          const dashboardPath = `/${storedUserRole}`;
          navigate(dashboardPath, { replace: true });
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_role');
        navigate('/login', { state: { from: location }, replace: true });
      }
    };

    validateToken();
  }, [navigate, location, allowedRoles, post]);

  if (isLoading) {
    return <LoadingFallback />;
  }

  // If user has no role, redirect to login
  const userRole = localStorage.getItem('user_role');
  if (!userRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user tries to access a route not allowed for their role, redirect to their dashboard
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    const dashboardPath = `/${userRole}`;
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

const AppContent = () => {
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const location = useLocation();

  const handleErrorClose = () => {
    setError(null);
  };

  // Check if user is logged in on initial load
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_role');
      }
    }
  }, []);

  // Set up axios response interceptor
  useEffect(() => {
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Handle unauthorized error
          if (location.pathname !== '/login') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            localStorage.removeItem('user_role');
            setUser(null);
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [location]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      <CssBaseline />
      <Navbar user={user} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%', overflow: 'auto' }}>
        <React.Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/password-reset" element={<PasswordResetRequest />} />
            <Route path="/password-reset/confirm/:uid/:token" element={<PasswordResetConfirm />} />
            <Route path="/about" element={
              <React.Suspense fallback={<LoadingFallback />}>
                <AboutUs />
              </React.Suspense>
            } />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/register" element={
              <React.Suspense fallback={<LoadingFallback />}>
                <StudentRegistrationForm />
              </React.Suspense>
            } />
            <Route path="/" element={<Navigate to="/landing" replace />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ErrorBoundary>
                  <AdminDashboard />
                </ErrorBoundary>
              </ProtectedRoute>
            } />
            
            {/* Faculty Routes */}
            <Route path="/faculty" element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <ErrorBoundary>
                  <FacultyDashboard />
                </ErrorBoundary>
              </ProtectedRoute>
            } />
            
            {/* Student Routes */}
            <Route path="/student" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ErrorBoundary>
                  <StudentDashboard />
                </ErrorBoundary>
              </ProtectedRoute>
            } />
            
            {/* Common Protected Routes */}
            <Route path="/students" element={
              <ProtectedRoute allowedRoles={['admin', 'faculty']}>
                <ErrorBoundary>
                  <StudentList />
                </ErrorBoundary>
              </ProtectedRoute>
            } />
            
            <Route path="/faculties" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ErrorBoundary>
                  <FacultyList />
                </ErrorBoundary>
              </ProtectedRoute>
            } />
            
            <Route path="/courses" element={
              <ProtectedRoute allowedRoles={['admin', 'faculty']}>
                <ErrorBoundary>
                  <CourseList />
                </ErrorBoundary>
              </ProtectedRoute>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </Box>
      {!['/login', '/password-reset', '/register'].includes(location.pathname) && <Footer />}
    </Box>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
