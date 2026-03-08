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
      // Try to parse JSON error body for a helpful message
      let errorBody = null;
      try {
        errorBody = await response.json();
      } catch (e) {
        // ignore JSON parse errors
      }
      const serverMessage = errorBody && (errorBody.message || errorBody.error || JSON.stringify(errorBody));
      const err = new Error(serverMessage || `HTTP error! status: ${response.status}`);
      err.status = response.status;
      err.body = errorBody;
      throw err;
    }

    // Parse successful response (may still be empty)
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      // If response is not JSON, return raw text
      return text;
    }
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
  // Create a Razorpay order (backend will initialize Razorpay order)
  createRazorpayOrder: (data) => apiCall('/orders/create-razorpay-order', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Verify Razorpay payment signature
  verifyRazorpayPayment: (data) => apiCall('/orders/verify-payment', {
    method: 'POST',
    body: JSON.stringify(data),
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

// Inquiry API calls
export const inquiryAPI = {
  // Create new inquiry
  create: (inquiryData) => apiCall('/inquiries', {
    method: 'POST',
    body: JSON.stringify(inquiryData),
  }),

  // Get all inquiries (Admin)
  getAll: () => apiCall('/inquiries'),

  // Update inquiry status
  updateStatus: (id, status) => apiCall(`/inquiries/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
};

// Health check
export const checkServerHealth = () => apiCall('/health');

// Upload API
export const uploadAPI = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    // We can't use our standard apiCall wrapper because we need to let the browser set the Content-Type to multipart/form-data organically to include boundary calculations.
    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Upload API Error:', error);
      throw error;
    }
  }
};

export default apiCall;
