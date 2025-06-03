import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true,  // Important for sending cookies with requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  withXSRFToken: true,
});

// Set default headers
axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';
axiosInstance.defaults.headers.common['Accept'] = 'application/json';

// Request queue for handling concurrent token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Get a cookie value by name
 * @param {string} name - The name of the cookie to get
 * @returns {string|null} The cookie value or null if not found
 */
export const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Helper function to set cookie
const setCookie = (name, value, days = 1) => {
  if (typeof document === 'undefined') return;
  
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax`;
};

// Helper function to set authorization header
export const setAuthHeader = (token) => {
  if (token) {
    // Set JWT token
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Also set CSRF token if available
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      axiosInstance.defaults.headers.common['X-CSRFToken'] = csrfToken;
    }
  } else {
    // Clear both tokens
    delete axiosInstance.defaults.headers.common['Authorization'];
    delete axiosInstance.defaults.headers.common['X-CSRFToken'];
  }
};

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch (e) {
    return true;
  }
};

// Helper object for authentication utilities
export const AuthUtils = {
  setTokens: (access, refresh) => {
    if (access) {
      localStorage.setItem('access_token', access);
      setAuthHeader(access);
    }
    if (refresh) {
      localStorage.setItem('refresh_token', refresh);
    }
  },
  clearTokens: () => {
    // Clear tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user');
    
    // Clear auth headers
    delete axiosInstance.defaults.headers.common['Authorization'];
    
    // Clear any pending requests
    if (typeof window !== 'undefined') {
      // Redirect to login page if we're in the browser
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
  },
  getAccessToken: () => {
    const token = localStorage.getItem('access_token');
    return token && !isTokenExpired(token) ? token : null;
  },
  getRefreshToken: () => {
    return localStorage.getItem('refresh_token');
  },
  isAuthenticated: () => {
    const token = AuthUtils.getAccessToken();
    return !!token;
  }
};

// List of public endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  '/api/login/',
  '/api/token/refresh/',
  '/api/registration-request/',  // For submitting new registration requests
  '/api/csrf/'
];

// Authentication endpoints
const AUTH_ENDPOINTS = {
  login: '/api/login/',
  refreshToken: '/api/token/refresh/',
  csrf: '/api/csrf/',
  userInfo: '/api/user-info/'
};

// Request interceptor to add auth tokens
axiosInstance.interceptors.request.use(
  async (config) => {
    // Skip for public endpoints
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some(path => 
      config.url.endsWith(path) || 
      config.url.includes(path) ||
      config.url.endsWith(path.replace(/\/$/, '')) ||  // Handle with or without trailing slash
      config.url.includes(path.replace(/\/$/, ''))
    );
    
    // Special case for login and token refresh
    const isAuthEndpoint = 
      config.url.endsWith(AUTH_ENDPOINTS.login) ||
      config.url.endsWith(AUTH_ENDPOINTS.refreshToken) ||
      config.url.endsWith(AUTH_ENDPOINTS.login.replace(/\/$/, '')) ||
      config.url.endsWith(AUTH_ENDPOINTS.refreshToken.replace(/\/$/, ''));
    
    // Always include credentials for all requests
    config.withCredentials = true;
    
    // Ensure headers exist
    config.headers = config.headers || {};
    
    // Set default headers
    config.headers['Content-Type'] = 'application/json';
    config.headers['Accept'] = 'application/json';
    
    // Get CSRF token from cookie
    let csrfToken = getCookie('csrftoken');
    
    // Add CSRF token to headers if available
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
    }
    
    // For non-public endpoints, add the Authorization header
    if (!isPublicEndpoint || config.url.includes('/api/registration-requests/')) {
      const token = AuthUtils.getAccessToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('Added Authorization header to request:', config.url);
      } else {
        console.warn('No access token found for protected endpoint:', config.url);
      }
    }
    
    // For non-public endpoints, ensure we have a valid CSRF token
    if ((!isPublicEndpoint || config.url.includes('/api/registration-requests/')) && !config.url.endsWith('/api/csrf/')) {
      try {
        if (!csrfToken) {
          console.log('No CSRF token found, fetching new one...');
          const csrfResponse = await axios.get(
            `${axiosInstance.defaults.baseURL}/api/csrf/`,
            { 
              withCredentials: true,
              headers: {
                'Accept': 'application/json'
              }
            }
          );
          csrfToken = getCookie('csrftoken');
          console.log('CSRF token obtained:', csrfToken ? '***' + csrfToken.slice(-8) : 'Not found');
        }
        
        // Set CSRF token in headers
        if (csrfToken) {
          config.headers['X-CSRFToken'] = csrfToken;
        }
      } catch (error) {
        console.warn('Failed to get CSRF token:', error);
        if (!isPublicEndpoint) {
          throw new Error('Failed to initialize session. Please refresh the page and try again.');
        }
      }
    }
    
    // Add JWT token for all non-public endpoints
    if (!isPublicEndpoint) {
      const token = AuthUtils.getAccessToken();
      console.log('Request to:', config.url);
      console.log('Is public endpoint:', isPublicEndpoint);
      console.log('Access token exists:', !!token);
      console.log('Current headers:', JSON.stringify(config.headers, null, 2));
      
      if (token) {
        // Ensure Authorization header is set with Bearer token
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('Authorization header set for request to:', config.url);
        console.log('Updated headers:', JSON.stringify(config.headers, null, 2));
      } else {
        console.warn('No valid auth token found for authenticated endpoint:', config.url);
        // Only redirect if we're not already on the login page
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(new Error('No authentication token found'));
      }
    }
    
    // Log request details for debugging
    if (process.env.NODE_ENV === 'development' || true) {  // Temporarily force debug logging
      const logInfo = {
        url: config.url,
        method: config.method,
        isPublicEndpoint,
        hasCsrfToken: !!csrfToken,
        hasAuthHeader: !!config.headers['Authorization']
      };
      console.log('API Request:', logInfo);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors and token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response [${response.status}]:`, {
        url: response.config.url,
        method: response.config.method,
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  async (error) => {
    // Don't handle aborted requests
    if (axios.isCancel(error) || 
        error?.code === 'ERR_CANCELED' || 
        error?.name === 'CanceledError' || 
        (error?.isAxiosError && error?.message?.includes('canceled'))) {
      return Promise.reject(error);
    }

    // Log the error for debugging
    const errorInfo = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message
    };
    
    console.error('API Error:', errorInfo);
    
    // Handle network errors
    if (!error.response) {
      const networkError = new Error('Network error. Please check your internet connection.');
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }

    const originalRequest = error.config;
    
    // If the error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If we're already refreshing, add to queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        })
        .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = AuthUtils.getRefreshToken();
      
      // If no refresh token, clear everything and redirect to login
      if (!refreshToken) {
        AuthUtils.clearTokens();
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }

      try {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        
        // Get a new CSRF token first
        await axios.get(
          `${baseURL}${AUTH_ENDPOINTS.csrf}`,
          { 
            withCredentials: true,
            headers: { 'Accept': 'application/json' }
          }
        );
        
        // Try to refresh the access token
        const response = await axios.post(
          `${baseURL}${AUTH_ENDPOINTS.refreshToken}`,
          { refresh: refreshToken },
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );
        
        const { access } = response.data;
        const newRefreshToken = response.data.refresh || refreshToken;
        
        // Update tokens
        AuthUtils.setTokens(access, newRefreshToken);
        
        // Process any queued requests with the new token
        processQueue(null, access);
        
        // Update the original request with the new token and CSRF
        originalRequest.headers.Authorization = `Bearer ${access}`;
        originalRequest.headers['X-CSRFToken'] = getCookie('csrftoken');
        
        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Clear tokens on refresh failure
        AuthUtils.clearTokens();
        
        // Process any queued requests with the error
        processQueue(refreshError, null);
        
        // Only redirect if this is a real error (not a cancellation)
        if (!axios.isCancel(refreshError) && 
            refreshError?.code !== 'ERR_CANCELED' && 
            refreshError?.name !== 'CanceledError') {
          // Use a timeout to allow the current error to be handled first
          setTimeout(() => {
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }, 0);
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // For 403 Forbidden errors, clear tokens and redirect to login
    if (error.response?.status === 403) {
      AuthUtils.clearTokens();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(new Error('Session expired. Please log in again.'));
    }
    
    // For other errors, just reject with the original error
    return Promise.reject(error);
  }
);

// Export the axios instance as default
export default axiosInstance;
