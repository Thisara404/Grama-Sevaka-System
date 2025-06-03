const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token ? `Bearer ${token}` : '';
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || 'An error occurred';
    } catch (e) {
      errorMessage = errorText || 'An error occurred';
    }
    throw new Error(errorMessage);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return await response.text();
};

// User API services
export const userAPI = {
  // Get current user profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken(),
      },
    });
    
    return handleResponse(response);
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken(),
      },
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  }
};

// Authentication API services
export const authAPI = {
  // Login
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    return handleResponse(response);
  },

  // Register
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  },

  // Logout
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthToken(),
      },
    });
    
    return handleResponse(response);
  }
};

// Emergency API services
export const emergencyAPI = {
  // Get all emergency reports
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    
    const url = `${API_BASE_URL}/emergency${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken(),
      },
    });
    
    return handleResponse(response);
  },

  // Create emergency report
  create: async (emergencyData) => {
    const response = await fetch(`${API_BASE_URL}/emergency`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken(),
      },
      body: JSON.stringify(emergencyData),
    });
    
    return handleResponse(response);
  },

  // Update emergency report status
  updateStatus: async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/emergency/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken(),
      },
      body: JSON.stringify({ status }),
    });
    
    return handleResponse(response);
  }
};

// Appointment API services
export const appointmentAPI = {
  // Get appointments
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.date) queryParams.append('date', params.date);
    
    const url = `${API_BASE_URL}/appointments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken(),
      },
    });
    
    return handleResponse(response);
  },

  // Create appointment
  create: async (appointmentData) => {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken(),
      },
      body: JSON.stringify(appointmentData),
    });
    
    return handleResponse(response);  },

  // Update appointment status
  updateStatus: async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken(),
      },
      body: JSON.stringify({ status }),
    });
    
    return handleResponse(response);
  }
};

// Forum API services
export const forumAPI = {
  // Get all discussions (public)
  getDiscussions: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.category) queryParams.append('category', params.category);
    if (params.search) queryParams.append('search', params.search);
    if (params.sort) queryParams.append('sort', params.sort);
    
    const url = `${API_BASE_URL}/forums/discussions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse(response);
  },

  // Get forum categories (public)
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/forums/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse(response);
  },

  // Get discussion by ID (public)
  getDiscussionById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/forums/discussions/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken(),
      },
    });
    
    return handleResponse(response);
  },

  // Create new discussion (authenticated)
  createDiscussion: async (discussionData) => {
    const response = await fetch(`${API_BASE_URL}/forums/discussions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken(),
      },
      body: JSON.stringify(discussionData),
    });
    
    return handleResponse(response);
  },

  // Update discussion (authenticated)
  updateDiscussion: async (id, discussionData) => {
    const response = await fetch(`${API_BASE_URL}/forums/discussions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken(),
      },
      body: JSON.stringify(discussionData),
    });
    
    return handleResponse(response);
  },

  // Delete discussion (authenticated)
  deleteDiscussion: async (id) => {
    const response = await fetch(`${API_BASE_URL}/forums/discussions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': getAuthToken(),
      },
    });
    
    return handleResponse(response);
  },

  // Add reply to discussion (authenticated)
  addReply: async (discussionId, replyData) => {
    const response = await fetch(`${API_BASE_URL}/forums/discussions/${discussionId}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken(),
      },
      body: JSON.stringify(replyData),
    });
    
    return handleResponse(response);
  },

  // Mark solution (authenticated)
  markSolution: async (discussionId, replyId) => {
    const response = await fetch(`${API_BASE_URL}/forums/discussions/${discussionId}/replies/${replyId}/solution`, {
      method: 'PUT',
      headers: {
        'Authorization': getAuthToken(),
      },
    });
    
    return handleResponse(response);
  },

  // Report discussion (authenticated)
  reportDiscussion: async (id, reason) => {
    const response = await fetch(`${API_BASE_URL}/forums/discussions/${id}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken(),
      },
      body: JSON.stringify({ reason }),
    });
    
    return handleResponse(response);
  },
  // Vote on discussion (authenticated)
  voteOnDiscussion: async (id, voteType) => {
    const response = await fetch(`${API_BASE_URL}/forums/discussions/${id}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken(),
      },
      body: JSON.stringify({ voteType }),
    });
    
    return handleResponse(response);
  },

  // Vote on reply (authenticated)
  voteOnReply: async (id, voteType) => {
    const response = await fetch(`${API_BASE_URL}/forums/replies/${id}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken(),
      },
      body: JSON.stringify({ voteType }),
    });
    
    return handleResponse(response);
  },

  // Update reply (authenticated)
  updateReply: async (id, replyData) => {
    const response = await fetch(`${API_BASE_URL}/forums/replies/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken(),
      },
      body: JSON.stringify(replyData),
    });
    
    return handleResponse(response);
  },

  // Delete reply (authenticated)
  deleteReply: async (id) => {
    const response = await fetch(`${API_BASE_URL}/forums/replies/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': getAuthToken(),
      },
    });
    
    return handleResponse(response);
  },

  // Report reply (authenticated)
  reportReply: async (id, reason) => {
    const response = await fetch(`${API_BASE_URL}/forums/replies/${id}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken(),
      },
      body: JSON.stringify({ reason }),
    });
    
    return handleResponse(response);
  },
};