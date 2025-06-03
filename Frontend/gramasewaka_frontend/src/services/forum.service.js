const API_URL = 'http://localhost:5000/api/forums';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Something went wrong');
  }
  return await response.json();
};

// Add this function to ensure consistent category data structure
const getCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/categories`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    const data = await handleResponse(response);
    
    // Ensure we have a consistent format
    if (Array.isArray(data)) {
      return data.map(category => {
        // If we have { _id, count } structure, use it
        if (category._id) {
          return category;
        }
        // If we have direct string values, transform them
        return { _id: category, count: 0 };
      });
    }
    
    // Fallback to default categories if API returned unexpected format
    return [
      { _id: 'General Discussion', count: 0 },
      { _id: 'Service Request', count: 0 },
      { _id: 'Community Issue', count: 0 },
      { _id: 'Announcement', count: 0 },
      { _id: 'Emergency', count: 0 },
      { _id: 'Legal Matter', count: 0 },
      { _id: 'Infrastructure', count: 0 },
      { _id: 'Healthcare', count: 0 },
      { _id: 'Education', count: 0 },
      { _id: 'Environment', count: 0 }
    ];
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return default categories on error
    return [
      { _id: 'General Discussion', count: 0 },
      { _id: 'Service Request', count: 0 },
      { _id: 'Community Issue', count: 0 },
      { _id: 'Announcement', count: 0 },
      { _id: 'Emergency', count: 0 },
      { _id: 'Legal Matter', count: 0 },
      { _id: 'Infrastructure', count: 0 },
      { _id: 'Healthcare', count: 0 },
      { _id: 'Education', count: 0 },
      { _id: 'Environment', count: 0 }
    ];
  }
};

export const forumService = {
  // Get all discussions with optional filters
  getDiscussions: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.category) queryParams.append('category', params.category);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sort) queryParams.append('sort', params.sort);
    
    const url = `${API_URL}/discussions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },
  
  // Get categories
  getCategories: async () => {
    const response = await fetch(`${API_URL}/categories`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },
  
  // Get a specific discussion by ID
  getDiscussionById: async (id) => {
    const response = await fetch(`${API_URL}/discussions/${id}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },
  
  // Create a new discussion
  createDiscussion: async (discussionData) => {
    const response = await fetch(`${API_URL}/discussions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(discussionData)
    });
    return handleResponse(response);
  },
  
  // Update a discussion
  updateDiscussion: async (id, discussionData) => {
    const response = await fetch(`${API_URL}/discussions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(discussionData)
    });
    return handleResponse(response);
  },
  
  // Delete a discussion
  deleteDiscussion: async (id) => {
    const response = await fetch(`${API_URL}/discussions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },
  
  // Add a reply to a discussion
  addReply: async (discussionId, replyData) => {
    const response = await fetch(`${API_URL}/discussions/${discussionId}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(replyData)
    });
    return handleResponse(response);
  },
  
  // Mark a reply as solution
  markSolution: async (discussionId, replyId) => {
    const response = await fetch(`${API_URL}/discussions/${discussionId}/replies/${replyId}/solution`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },
  
  // Vote on a discussion
  voteOnDiscussion: async (id, voteType) => {
    const response = await fetch(`${API_URL}/discussions/${id}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ voteType })
    });
    return handleResponse(response);
  },
  
  // Vote on a reply
  voteOnReply: async (id, voteType) => {
    const response = await fetch(`${API_URL}/replies/${id}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ voteType })
    });
    return handleResponse(response);
  },
  
  // Update a reply
  updateReply: async (id, replyData) => {
    const response = await fetch(`${API_URL}/replies/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(replyData)
    });
    return handleResponse(response);
  },
  
  // Delete a reply
  deleteReply: async (id) => {
    const response = await fetch(`${API_URL}/replies/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },
  
  // Mark a discussion as official (GS only)
  markAsOfficial: async (id, isOfficial) => {
    const response = await fetch(`${API_URL}/discussions/${id}/official`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ isOfficial })
    });
    return handleResponse(response);
  },
  
  // Get reported content (GS only)
  getReportedContent: async () => {
    const response = await fetch(`${API_URL}/moderation/reported`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },
  
  // Handle reported content (GS only)
  handleReportedContent: async (contentType, id, action) => {
    const response = await fetch(`${API_URL}/moderation/${contentType}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ action })
    });
    return handleResponse(response);
  },
  
  // GS only: Toggle pin status
  togglePinned: async (id, isPinned) => {
    return this.updateDiscussion(id, { isPinned });
  },
  
  // GS only: Toggle lock status
  toggleLocked: async (id, isLocked) => {
    const status = isLocked ? 'locked' : 'active';
    return this.updateDiscussion(id, { status });
  },
  // Get forum statistics (GS only)
  getForumStats: async () => {
    const response = await fetch(`${API_URL}/stats`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  }
};