// API Configuration for connecting frontend to backend
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Mushroom API calls
export const mushroomAPI = {
  // Get all mushrooms
  getAll: () => apiCall('/mushrooms'),
  
  // Get single mushroom
  getById: (id) => apiCall(`/mushrooms/${id}`),
  
  // Get mushrooms by category
  getByCategory: (category) => apiCall(`/mushrooms/category/${category}`),
  
  // Create new mushroom (admin only)
  create: (mushroomData) => apiCall('/mushrooms', {
    method: 'POST',
    body: JSON.stringify(mushroomData),
  }),
  
  // Update mushroom (admin only)
  update: (id, mushroomData) => apiCall(`/mushrooms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(mushroomData),
  }),
  
  // Delete mushroom (admin only)
  delete: (id) => apiCall(`/mushrooms/${id}`, {
    method: 'DELETE',
  }),
};

// Order API calls
export const orderAPI = {
  // Get all orders
  getAll: () => apiCall('/orders'),
  
  // Get single order
  getById: (id) => apiCall(`/orders/${id}`),
  
  // Get user's orders
  getUserOrders: (userId) => apiCall(`/orders/user/${userId}`),
  
  // Create new order
  create: (orderData) => apiCall('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  
  // Update order status
  updateStatus: (id, status) => apiCall(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
};

// User API calls
export const userAPI = {
  // Register new user
  register: (userData) => apiCall('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  // Login user
  login: (credentials) => apiCall('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  // Get all users
  getAll: () => apiCall('/users'),
  
  // Get single user
  getById: (id) => apiCall(`/users/${id}`),
  
  // Update user
  update: (id, userData) => apiCall(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
};

// Health check
export const checkServerHealth = () => apiCall('/health');

export default apiCall;
