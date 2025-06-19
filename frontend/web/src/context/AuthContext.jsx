import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axiosInstance from '../services/axiosConfig';
import { AuthenticationError, NetworkError, Logger } from '../utils/errorHandler';
import { jwtDecode } from 'jwt-decode';

// Create the context
const AuthContext = createContext({
  user: null,
  setUser: () => {},
  loading: true,
  error: null,
  refreshToken: () => Promise.resolve()
});

// Create the provider component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refresh token function
  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token'); 
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      // Use axiosInstance for the refresh call
      const response = await axiosInstance.post('/api/token/refresh/', {
        refresh: refreshTokenValue
      });

      // Store new tokens
      localStorage.setItem('access_token', response.data.access);
      // Assuming the refresh endpoint also returns a new refresh token
      if (response.data.refresh) {
        localStorage.setItem('refresh_token', response.data.refresh);
      }

      // Update user info if needed
      const decoded = jwtDecode(response.data.access);
      setUser(decoded);
      setError(null);

      return response.data.access;
    } catch (err) { 
      console.error('Error refreshing token:', err);
      Logger.error('Token Refresh Error', { error: err });
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user'); 
      setUser(null); 
      setError('Session expired. Please login again.');
      window.location.href = '/login';
      return null;
    }
  };

  // Initial token check and refresh
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true); 
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            Logger.info('Access token expired, attempting refresh.');
            await refreshToken(); 
          } else {
            setUser(decoded);
            Logger.info('User authenticated from existing token.');
          }
        }
      } catch (err) { 
        console.error('Error checking auth:', err);
        Logger.error('Initial Auth Check Error', { error: err });
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
        // setError('Authentication error. Please login again.'); 
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []); 

  // Axios interceptor setup on component mount
  useEffect(() => {
    // Apply interceptors to axiosInstance
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If error is not 401 or it's a retry request, reject
        if (error.response?.status !== 401 || originalRequest._retry) {
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          const newToken = await refreshToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          // Clear tokens and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          setUser(null);
          window.location.href = '/login';
        }

        return Promise.reject(error);
      }
    );

    // Cleanup function
    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [refreshToken]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    setUser: (userData) => {
      setUser(userData);
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('user_role', userData.role || userData.user_role);
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('user_role');
      }
    },
    loading,
    error,
    refreshToken
  }), [user, loading, error, refreshToken]);

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the context and provider
export { AuthContext, AuthProvider, useAuth };
export default AuthProvider;
