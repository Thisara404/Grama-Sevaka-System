import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MegaphoneIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Sidebar from '../../components/sidebar/gramasewaka.sidebar';
import Navbar from '../../components/navbar/gramasewaka.navbar';
import { AnnouncementService } from '../../services/announcement.service';

const GSAnnouncements = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [userData, setUserData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    priority: 'medium',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isActive: true,
    isPinned: false,
    targetAudience: 'all'
  });

  const categories = [
    'General Information',
    'Emergency',
    'Community Event',
    'Public Service',
    'Weather Alert',
    'Holiday',
    'Infrastructure',
    'Health',
    'Education',
    'Environment',
    'Other'
  ];

  useEffect(() => {
    fetchUserData();
    fetchAnnouncements();
  }, []);

  const fetchUserData = () => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  };

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError('');
      // Get all announcements, including inactive ones for GS officer view
      const response = await AnnouncementService.getAnnouncements({ active: 'false' });
      
      if (response && response.announcements) {
        setAnnouncements(response.announcements);
      } else {
        setAnnouncements([]);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError(err.message || 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Clear previous errors
      setError('');
      setValidationErrors({});
      
      // Validate form data
      const validation = AnnouncementService.validate(formData);
      if (!validation.valid) {
        setValidationErrors(validation.errors);
        return;
      }
      
      // Format dates properly for API
      const formattedData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
      };
      
      if (selectedAnnouncement) {
        // Update existing announcement
        await AnnouncementService.updateAnnouncement(selectedAnnouncement._id, formattedData);
      } else {
        // Create new announcement
        await AnnouncementService.createAnnouncement(formattedData);
      }
      
      // Reset form and close modal
      resetForm();
      setShowCreateModal(false);
      setShowEditModal(false);
      
      // Refresh announcements list
      fetchAnnouncements();
    } catch (err) {
      console.error('Error saving announcement:', err);
      setError(err.message || 'Failed to save announcement');
    }
  };

  const handleEdit = (announcement) => {
    setSelectedAnnouncement(announcement);
    
    // Clear previous errors
    setError('');
    setValidationErrors({});
    
    // Format dates for form inputs
    const startDate = announcement.startDate ? new Date(announcement.startDate).toISOString().split('T')[0] : '';
    const endDate = announcement.endDate ? new Date(announcement.endDate).toISOString().split('T')[0] : '';
    
    setFormData({
      title: announcement.title || '',
      content: announcement.content || '',
      category: announcement.category || '',
      priority: announcement.priority || 'medium',
      startDate: startDate,
      endDate: endDate,
      isActive: announcement.isActive !== undefined ? announcement.isActive : true,
      isPinned: announcement.isPinned || false,
      targetAudience: announcement.targetAudience || 'all'
    });
    
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        setError('');
        await AnnouncementService.deleteAnnouncement(id);
        
        // Remove from local state
        setAnnouncements(announcements.filter(item => item._id !== id));
      } catch (err) {
        console.error('Error deleting announcement:', err);
        setError(err.message || 'Failed to delete announcement');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: '',
      priority: 'medium',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      isActive: true,
      isPinned: false,
      targetAudience: 'all'
    });
    setSelectedAnnouncement(null);
    setValidationErrors({});
    setError('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error for this field as user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (isActive, startDate, endDate) => {
    const now = new Date();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (!isActive) {
      return 'bg-gray-100 text-gray-800';
    }
    
    if (start && start > now) {
      return 'bg-purple-100 text-purple-800'; // Scheduled
    }
    
    if (end && end < now) {
      return 'bg-gray-100 text-gray-800'; // Expired
    }
    
    return 'bg-green-100 text-green-800'; // Active
  };

  const getStatusText = (isActive, startDate, endDate) => {
    const now = new Date();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (!isActive) {
      return 'Inactive';
    }
    
    if (start && start > now) {
      return 'Scheduled';
    }
    
    if (end && end < now) {
      return 'Expired';
    }
    
    return 'Active';
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by tab
    if (activeTab === 'all') {
      return matchesSearch;
    } else if (activeTab === 'active') {
      return matchesSearch && announcement.isActive;
    } else if (activeTab === 'inactive') {
      return matchesSearch && !announcement.isActive;
    } else if (activeTab === 'pinned') {
      return matchesSearch && announcement.isPinned;
    }
    
    return matchesSearch;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex min-h-screen bg-light">
      <Sidebar />
      <div className="ml-64 w-full flex flex-col">
        <Navbar userFullName={userData?.fullName} userRole="gs" />
        <main className="flex-1 overflow-auto p-6 mt-16 mb-16">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MegaphoneIcon className="w-8 h-8 text-primary mr-3" />
                  <h1 className="text-2xl font-bold text-primary">Announcement Management</h1>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create Announcement
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Tabs and filters */}
            <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'active', label: 'Active' },
                    { key: 'inactive', label: 'Inactive' },
                    { key: 'pinned', label: 'Pinned' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.key
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 md:max-w-md">
                  <input
                    type="text"
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Announcements list */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredAnnouncements.length > 0 ? (
                  filteredAnnouncements.map((announcement) => (
                    <div key={announcement._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-xl font-semibold text-gray-800 flex-1">
                              {announcement.title}
                              {announcement.isPinned && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Pinned
                                </span>
                              )}
                            </h3>
                            <div className="flex space-x-2 ml-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                                {announcement.priority}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(announcement.isActive, announcement.startDate, announcement.endDate)}`}>
                                {getStatusText(announcement.isActive, announcement.startDate, announcement.endDate)}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 mb-4 line-clamp-3">{announcement.content}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              <span>Created: {formatDate(announcement.createdAt)}</span>
                            </div>
                            <div className="flex items-center">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              <span>Start: {formatDate(announcement.startDate)}</span>
                            </div>
                            {announcement.endDate && (
                              <div className="flex items-center">
                                <ClockIcon className="w-4 h-4 mr-1" />
                                <span>End: {formatDate(announcement.endDate)}</span>
                              </div>
                            )}
                            <div className="flex items-center">
                              <EyeIcon className="w-4 h-4 mr-1" />
                              <span>{announcement.views || 0} views</span>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {announcement.category}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {announcement.targetAudience}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(announcement)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                            title="Edit"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(announcement._id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                            title="Delete"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MegaphoneIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No announcements found</p>
                  </div>
                )}
              </div>
            )}

            {/* Create/Edit Modal */}
            {(showCreateModal || showEditModal) && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                  <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}></div>

                  <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium text-gray-900">
                        {selectedAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                      </h3>
                      <button
                        onClick={() => {
                          setShowCreateModal(false);
                          setShowEditModal(false);
                          resetForm();
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <span className="sr-only">Close</span>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title * <span className="text-xs text-gray-500">(max 100 characters)</span>
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          required
                          maxLength={100}
                          className={`w-full px-3 py-2 border ${validationErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                          placeholder="Enter announcement title"
                        />
                        {validationErrors.title && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          {formData.title.length}/100 characters
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Content *
                        </label>
                        <textarea
                          name="content"
                          value={formData.content}
                          onChange={handleChange}
                          required
                          rows={4}
                          className={`w-full px-3 py-2 border ${validationErrors.content ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                          placeholder="Enter announcement content"
                        />
                        {validationErrors.content && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.content}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category *
                          </label>
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className={`w-full px-3 py-2 border ${validationErrors.category ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                          >
                            <option value="">Select Category</option>
                            {categories.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                          {validationErrors.category && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.category}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Priority
                          </label>
                          <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date (Optional)
                          </label>
                          <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${validationErrors.endDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                          />
                          {validationErrors.endDate && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.endDate}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Target Audience
                        </label>
                        <select
                          name="targetAudience"
                          value={formData.targetAudience}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                          <option value="all">All</option>
                          <option value="citizens">Citizens Only</option>
                          <option value="gs-officers">GS Officers Only</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-6">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Active</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="isPinned"
                            checked={formData.isPinned}
                            onChange={handleChange}
                            className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Pin to top</span>
                        </label>
                      </div>

                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateModal(false);
                            setShowEditModal(false);
                            resetForm();
                          }}
                          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
                        >
                          {selectedAnnouncement ? 'Update' : 'Create'} Announcement
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default GSAnnouncements;