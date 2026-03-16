// API Configuration for connecting frontend to backend
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
export const BASE_URL = API_BASE_URL.replace('/api', '');

// Helper to resolve static asset URLs (images/models)
export const getAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
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

  // Add review
  addReview: (id, reviewData) => apiCall(`/mushrooms/${id}/reviews`, {
    method: 'POST',
    body: JSON.stringify(reviewData),
  }),

  // Normalize product details (admin helper)
  normalize: ({ force = false } = {}) => apiCall('/mushrooms/normalize', {
    method: 'POST',
    body: JSON.stringify({ force }),
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

  // Delete user account
  delete: (id) => apiCall(`/users/${id}`, {
    method: 'DELETE',
  }),

  // Change password
  changePassword: (id, currentPassword, newPassword) => apiCall(`/users/${id}/change-password`, {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  }),

  // Toggle Wishlist
  toggleWishlist: (productId) => apiCall(`/users/wishlist/${productId}`, {
    method: 'POST',
  }),

  // Get Wishlist items
  getWishlist: () => apiCall('/users/wishlist/items'),
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

// AR Mushroom (marker scanning) API calls
export const arAPI = {
  // Get all AR mushrooms (marker catalog)
  getAllMushrooms: () => apiCall('/ar/mushrooms'),

  // Get a single AR mushroom by markerKey
  getMushroomByMarkerKey: (markerKey) => apiCall(`/ar/mushrooms/${encodeURIComponent(markerKey)}`),

  // Get recent scans (debug)
  getRecentScans: ({ limit = 20, days = 0 } = {}) =>
    apiCall(`/ar/scans?limit=${encodeURIComponent(limit)}&days=${encodeURIComponent(days)}`),

  // Analytics (admin)
  getAnalytics: (days = 30) => apiCall(`/ar/analytics?days=${encodeURIComponent(days)}`),

  // Marker CRUD (admin)
  createMushroom: (payload) =>
    apiCall('/ar/mushrooms', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateMushroom: (markerKey, payload) =>
    apiCall(`/ar/mushrooms/${encodeURIComponent(markerKey)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteMushroom: (markerKey) =>
    apiCall(`/ar/mushrooms/${encodeURIComponent(markerKey)}`, {
      method: 'DELETE',
    }),

  // Store a scan and get randomized nutrients back (server-side)
  scan: ({ markerKey, confidencePct = null, source = 'marker', rawValue = null } = {}) =>
    apiCall('/ar/scan', {
      method: 'POST',
      body: JSON.stringify({ markerKey, confidencePct, source, rawValue }),
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
