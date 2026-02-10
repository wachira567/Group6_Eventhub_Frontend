import { API_BASE_URL } from './constants';
import { store } from '../store/store';
import { logout, setTokens } from '../store/slices/authSlice';
import { toast } from 'sonner';

/**
 * Makes an authenticated API request with automatic token handling and refresh
 * @param {string} endpoint - API endpoint (relative to base URL)
 * @param {Object} options - Fetch options
 * @param {boolean} isRetry - Whether this is a retry after token refresh
 * @returns {Promise<Response>} - Fetch response
 */
export const apiRequest = async (endpoint, options = {}, isRetry = false) => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add auth header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle 401 - Unauthorized
    if (response.status === 401) {
      // If this is already a retry, or no refresh token available, logout
      if (isRetry || !refreshToken) {
        console.log('Token expired or invalid, logging out...');
        store.dispatch(logout());
        toast.error('Session expired', {
          description: 'Please log in again to continue.',
        });
        
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
        
        throw new Error('Session expired');
      }
      
      // Try to refresh the token
      console.log('Token expired, attempting to refresh...');
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          
          // Store new tokens
          const newAccessToken = refreshData.access_token;
          localStorage.setItem('token', newAccessToken);
          localStorage.setItem('refreshToken', refreshToken);
          
          // Update Redux store
          store.dispatch(setTokens({
            token: newAccessToken,
            refreshToken: refreshToken
          }));
          
          console.log('Token refreshed successfully, retrying request...');
          
          // Retry the original request with new token
          return apiRequest(endpoint, options, true);
        } else {
          // Refresh failed, logout
          console.log('Token refresh failed, logging out...');
          store.dispatch(logout());
          toast.error('Session expired', {
            description: 'Please log in again to continue.',
          });
          
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
          
          throw new Error('Session expired');
        }
      } catch (refreshError) {
        if (refreshError.message === 'Session expired') {
          throw refreshError;
        }
        console.error('Token refresh error:', refreshError);
        store.dispatch(logout());
        toast.error('Session expired', {
          description: 'Please log in again to continue.',
        });
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
        
        throw new Error('Session expired');
      }
    }
    
    return response;
  } catch (error) {
    if (error.message === 'Session expired') {
      throw error;
    }
    
    console.error('API request failed:', error);
    throw new Error('Network error. Please check your connection.');
  }
};

/**
 * Helper function for GET requests
 */
export const apiGet = (endpoint) => apiRequest(endpoint, { method: 'GET' });

/**
 * Helper function for POST requests
 */
export const apiPost = (endpoint, data) => 
  apiRequest(endpoint, { 
    method: 'POST', 
    body: JSON.stringify(data) 
  });

/**
 * Helper function for PUT requests
 */
export const apiPut = (endpoint, data) => 
  apiRequest(endpoint, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  });

/**
 * Helper function for DELETE requests
 */
export const apiDelete = (endpoint) => apiRequest(endpoint, { method: 'DELETE' });
