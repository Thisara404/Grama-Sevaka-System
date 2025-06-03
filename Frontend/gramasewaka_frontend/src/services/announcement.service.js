const API_URL = 'http://localhost:5000/api';

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

// Validation functions
const validateAnnouncement = (announcementData) => {
  const errors = {};
  
  // Validate title (max 100 characters)
  if (announcementData.title && announcementData.title.length > 100) {
    errors.title = 'Title cannot be more than 100 characters';
  }
  
  // Validate content (required)
  if (!announcementData.content || announcementData.content.trim() === '') {
    errors.content = 'Content is required';
  }
  
  // Validate category (required)
  if (!announcementData.category || announcementData.category.trim() === '') {
    errors.category = 'Category is required';
  }
  
  // Validate dates
  if (announcementData.startDate && announcementData.endDate) {
    const startDate = new Date(announcementData.startDate);
    const endDate = new Date(announcementData.endDate);
    
    if (endDate < startDate) {
      errors.endDate = 'End date cannot be before start date';
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

export const AnnouncementService = {
  // Get all announcements with optional filters
  getAnnouncements: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.category) queryParams.append('category', params.category);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.active !== undefined) queryParams.append('active', params.active);
    if (params.search) queryParams.append('search', params.search);
    if (params.audience) queryParams.append('audience', params.audience);
    
    const url = `${API_URL}/announcements${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse(response);
  },
  
  // Get recent announcements for citizens
  getRecentAnnouncements: async (limit = 5) => {
    const response = await fetch(`${API_URL}/announcements?limit=${limit}&audience=citizens`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await handleResponse(response);
    return data.announcements || [];
  },

  // Get announcement by ID
  getAnnouncementById: async (id) => {
    const response = await fetch(`${API_URL}/announcements/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse(response);
  },

  // Create new announcement (GS only)
  createAnnouncement: async (announcementData) => {
    // Validate before sending to server
    const validation = validateAnnouncement(announcementData);
    if (!validation.valid) {
      throw new Error(Object.values(validation.errors)[0]); // Return first error message
    }
    
    const response = await fetch(`${API_URL}/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken(),
      },
      body: JSON.stringify(announcementData),
    });
    
    return handleResponse(response);
  },

  // Update announcement (GS only)
  updateAnnouncement: async (id, announcementData) => {
    // Validate before sending to server
    const validation = validateAnnouncement(announcementData);
    if (!validation.valid) {
      throw new Error(Object.values(validation.errors)[0]); // Return first error message
    }
    
    const response = await fetch(`${API_URL}/announcements/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken(),
      },
      body: JSON.stringify(announcementData),
    });
    
    return handleResponse(response);
  },

  // Delete announcement (GS only)
  deleteAnnouncement: async (id) => {
    const response = await fetch(`${API_URL}/announcements/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': getAuthToken(),
      },
    });
    
    return handleResponse(response);
  },
  
  // Get announcement categories
  getAnnouncementCategories: async () => {
    const response = await fetch(`${API_URL}/announcements/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse(response);
  },
  
  // Validate announcement data (can be used in forms before submission)
  validate: validateAnnouncement
};