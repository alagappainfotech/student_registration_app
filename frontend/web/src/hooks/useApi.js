import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import axiosInstance, { AuthUtils } from '../services/axiosConfig';

// List of endpoints that don't require authentication
const publicEndpoints = [
  '/api/token/',
  '/api/token/refresh/',
  '/api/registration-request/',
  '/api/csrf/'
];

// Helper function to get cookie by name
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Export the axios instance for direct API calls
export const api = axiosInstance;

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const isMounted = useRef(true);

  // Cleanup function to handle component unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const callApi = useCallback(async (method, url, requestData = null, config = {}) => {
    // Set loading state
    setLoading(true);
    setError(null);
    
    // Check if we need to skip auth for this endpoint
    const skipAuth = config.skipAuth || publicEndpoints.some(endpoint => url.includes(endpoint));
    
    try {
      // Check if we're offline
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('You are currently offline. Please check your connection.');
      }

      // Get the authentication token from localStorage
      const token = localStorage.getItem('access_token');
      const csrfToken = getCookie('csrftoken');
      
      // Log the request details for debugging
      console.log(`useApi: Preparing ${method} request to ${url}`, {
        skipAuth,
        hasRequestData: !!requestData,
        config
      });
      
      // Prepare the request config
      const requestConfig = {
        method: method.toUpperCase(),
        url,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && !skipAuth && { 'Authorization': `Bearer ${token}` }),
          ...(csrfToken && { 'X-CSRFToken': csrfToken }),
          ...(config?.headers || {})
        },
        withCredentials: true,
        ...config
      };
      
      // Only include data for methods that support it
      if (requestData && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
        requestConfig.data = requestData;
      } else if (method === 'GET' && requestData) {
        // For GET requests, add data as params
        requestConfig.params = requestData;
      }
      
      // Add skipAuth to the config
      if (skipAuth) {
        requestConfig.skipAuth = true;
      }
      
      // Log the request (with sensitive data redacted)
      console.log(`useApi: Sending ${method} request to ${url}`, { 
        ...requestConfig,
        headers: {
          ...requestConfig.headers,
          Authorization: requestConfig.headers.Authorization ? 'Bearer [REDACTED]' : undefined,
          'X-CSRFToken': requestConfig.headers['X-CSRFToken'] ? '***' : undefined
        }
      });
      
      // Make the request
      const response = await axiosInstance(requestConfig);
      
      // Log the successful response
      console.log(`useApi: Success response from ${url}`, {
        status: response.status,
        data: response.data
      });
      
      // Update state with the response data
      setData(response.data);
      setLoading(false);
      
      // Return the successful response
      return response;
      
    } catch (error) {
      console.error('API call error:', error);
      
      // Don't update state if component is unmounted
      if (!isMounted.current) {
        return { isCanceled: true };
      }
      
      // Reset loading state
      setLoading(false);
      
      // Handle request cancellation
      if (axios.isCancel(error)) {
        console.log('Request was canceled:', error.message);
        return { isCanceled: true };
      }
      
      // Prepare error object with more details
      let errorMessage = 'An error occurred';
      let errorDetails = {};
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response error:', {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data
        });
        
        errorMessage = error.response.data?.detail || 
                     error.response.data?.message ||
                     error.response.statusText ||
                     'Request failed';
                     
        errorDetails = {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        };
        
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request
        console.error('Request setup error:', error.message);
        errorMessage = error.message;
      }

      const errorObj = {
        message: errorMessage,
        ...errorDetails,
        originalError: error,
        isCanceled: false,
        isNetworkError: !error.response && !error.request
      };

      // Set the error state
      setError(errorObj);
      
      // Return the error object in a consistent format
      return { error: errorObj }; 
    }
  }, []);

  // Convenience methods
  const get = useCallback(async (url, params = {}, config = {}) => {
    return callApi('get', url, params, config);
  }, [callApi]);

  const post = useCallback(async (url, data, config = {}) => {
    return callApi('post', url, data, config);
  }, [callApi]);

  const put = useCallback(async (url, data, config = {}) => {
    return callApi('put', url, data, config);
  }, [callApi]);

  const del = useCallback(async (url, config = {}) => {
    return callApi('delete', url, null, config);
  }, [callApi]);

  const patch = useCallback(async (url, data, config = {}) => {
    return callApi('patch', url, data, config);
  }, [callApi]);

  return {
    // State
    loading,
    error,
    data,
    
    // Main method
    callApi,
    
    // Convenience methods
    get,
    post,
    put,
    del,
    delete: del, // Alias for del
    patch,
    
    // Helper methods
    clearError: () => setError(null),
    clearData: () => setData(null),
    setData // For manual data updates if needed
  };
};

export default useApi;
