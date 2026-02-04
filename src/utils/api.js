import { API_BASE_URL } from './constants';
import { store } from '../store/store';
import { logout } from '../store/slices/authSlice';
import { toast } from 'sonner';

/**
 * Makes an authenticated API request with automatic token handling
 * @param {string} endpoint - API endpoint (relative to base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
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
