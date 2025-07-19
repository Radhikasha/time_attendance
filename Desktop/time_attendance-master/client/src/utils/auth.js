/**
 * Authentication utility functions
 */

/**
 * Set the auth token in localStorage and axios headers
 * @param {string} token - JWT token
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

/**
 * Remove the auth token from localStorage and axios headers
 */
export const removeAuthToken = () => {
  localStorage.removeItem('token');
  delete axios.defaults.headers.common['x-auth-token'];
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated, false otherwise
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    // Decode token to check expiration
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return decoded.exp > Date.now() / 1000;
  } catch (err) {
    return false;
  }
};

/**
 * Get the current user from localStorage
 * @returns {Object|null} User object or null if not found
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Set the current user in localStorage
 * @param {Object} user - User object
 */
export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

/**
 * Check if user has required role
 * @param {string|Array} roles - Required role(s)
 * @returns {boolean} True if user has required role
 */
export const hasRole = (roles) => {
  const user = getCurrentUser();
  if (!user || !user.role) return false;
  
  if (Array.isArray(roles)) {
    return roles.includes(user.role);
  }
  
  return user.role === roles;
};

/**
 * Check if user has any of the required permissions
 * @param {Array} permissions - Required permissions
 * @returns {boolean} True if user has any of the required permissions
 */
export const hasAnyPermission = (permissions) => {
  const user = getCurrentUser();
  if (!user || !user.permissions) return false;
  
  return permissions.some(permission => 
    user.permissions.includes(permission)
  );
};

/**
 * Check if user has all required permissions
 * @param {Array} permissions - Required permissions
 * @returns {boolean} True if user has all required permissions
 */
export const hasAllPermissions = (permissions) => {
  const user = getCurrentUser();
  if (!user || !user.permissions) return false;
  
  return permissions.every(permission => 
    user.permissions.includes(permission)
  );
};

/**
 * Format error message from API response
 * @param {Object} error - Error object from axios
 * @returns {string} Formatted error message
 */
export const formatError = (error) => {
  if (!error) return 'An unknown error occurred';
  
  if (error.response) {
    // Server responded with a status code outside 2xx
    const { data } = error.response;
    
    if (data && data.errors) {
      // Handle validation errors
      return Object.values(data.errors)
        .map(err => Array.isArray(err) ? err.join(' ') : err)
        .join('\n');
    }
    
    if (data && data.message) {
      return data.message;
    }
    
    return error.response.statusText || 'An error occurred';
  } 
  
  if (error.request) {
    // Request was made but no response received
    return 'No response from server. Please check your connection.';
  }
  
  // Something happened in setting up the request
  return error.message || 'An error occurred';
};

/**
 * Logout user and redirect to login page
 * @param {Function} dispatch - Redux dispatch function
 * @param {string} redirectTo - Path to redirect after logout (default: '/login')
 */
export const logoutUser = (dispatch, redirectTo = '/login') => {
  removeAuthToken();
  localStorage.removeItem('user');
  
  if (dispatch) {
    dispatch({ type: 'LOGOUT' });
  }
  
  // Redirect to login page
  window.location.href = redirectTo;
};

/**
 * Format date to display in UI
 * @param {string|Date} date - Date to format
 * @param {string} format - Date format (default: 'MM/DD/YYYY')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'MM/DD/YYYY') => {
  if (!date) return '';
  
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  return format
    .replace('MM', month)
    .replace('DD', day)
    .replace('YYYY', year);
};

/**
 * Format time to display in UI
 * @param {string|Date} date - Date object or string
 * @returns {string} Formatted time string (HH:MM AM/PM)
 */
export const formatTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  return `${hours}:${minutes} ${ampm}`;
};

/**
 * Calculate time difference between two dates
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {Object} Object with hours, minutes, and seconds
 */
export const getTimeDifference = (start, end) => {
  if (!start || !end) return { hours: 0, minutes: 0, seconds: 0 };
  
  const diffMs = new Date(end) - new Date(start);
  const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
  const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
  const diffSecs = Math.round((((diffMs % 86400000) % 3600000) % 60000) / 1000);
  
  return {
    hours: diffHrs,
    minutes: diffMins,
    seconds: diffSecs,
    toString: () => `${diffHrs}h ${diffMins}m ${diffSecs}s`
  };
};
