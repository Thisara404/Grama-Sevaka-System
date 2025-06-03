import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { forumAPI } from '../../api/services';
import Sidebar from '../../components/sidebar/gramasewaka.sidebar';
import Navbar from '../../components/navbar/gramasewaka.navbar';
import Footer from '../../components/footer/gramasewaka.footer';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Eye, 
  Calendar,
  User,
  Tag,
  AlertTriangle,
  CheckCircle,
  Pin,
  Lock,
  Trash2,
  Flag,
  Shield,
  BarChart3,
  Settings,
  Edit,
  Star
} from 'lucide-react';

const GSForum = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [activeTab, setActiveTab] = useState('discussions');
  
  // Fallback categories that match backend ForumDiscussion model enum
  const fallbackCategories = [
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

  // New discussion form state
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    isPinned: false,
    isOfficial: false
  });

  // Moderation state
  const [reportedContent, setReportedContent] = useState({ discussions: [], replies: [] });
  const [forumStats, setForumStats] = useState({});
  
  useEffect(() => {
    // Get user data from localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    
    if (activeTab === 'discussions') {
      fetchDiscussions();
      fetchCategories();
    } else if (activeTab === 'moderation') {
      fetchReportedContent();
    } else if (activeTab === 'stats') {
      fetchForumStats();
    }
  }, [currentPage, selectedCategory, sortBy, searchTerm, activeTab]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        category: selectedCategory,
        search: searchTerm,
        sort: sortBy
      };
      
      const response = await forumAPI.getDiscussions(params);
      setDiscussions(response.discussions || []);
      setTotalPages(response.pages || 1);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      console.log('Fetching categories...');
      const response = await forumAPI.getCategories();
      console.log('Categories response:', response);
      
      if (response && Array.isArray(response) && response.length > 0) {
        // Ensure consistent format for categories
        const formattedCategories = response.map(cat => {
          if (typeof cat === 'string') {
            return { _id: cat, count: 0 };
          }
          return cat;
        });
        setCategories(formattedCategories);
        console.log('Categories loaded successfully:', formattedCategories);
      } else {
        console.log('No categories returned from API, using fallback categories');
        setCategories(fallbackCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.log('Using fallback categories due to error');
      setCategories(fallbackCategories);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchReportedContent = async () => {
    try {
      setLoading(true);
      // This would need to be implemented in the API
      const response = await forumAPI.getReportedContent();
      setReportedContent(response || { discussions: [], replies: [] });
    } catch (error) {
      console.error('Error fetching reported content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchForumStats = async () => {
    try {
      setLoading(true);
      // This would need to be implemented in the API
      const response = await forumAPI.getForumStats();
      setForumStats(response || {});
    } catch (error) {
      console.error('Error fetching forum stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    try {
      const discussionData = {
        ...newDiscussion,
        isPinned: newDiscussion.isPinned,
        // isOfficial would be set after creation via separate API call
      };
      
      const response = await forumAPI.createDiscussion(discussionData);
      
      // If marked as official, make additional API call
      if (newDiscussion.isOfficial && response.discussionId) {
        await forumAPI.markAsOfficial(response.discussionId, true);
      }
      
      setNewDiscussion({ 
        title: '', 
        content: '', 
        category: '', 
        tags: '', 
        isPinned: false, 
        isOfficial: false 
      });
      setShowNewDiscussion(false);
      fetchDiscussions();
      alert('Discussion created successfully!');
    } catch (error) {
      alert('Error creating discussion: ' + error.message);
    }
  };

  const handleVote = async (discussionId, voteType) => {
    try {
      await forumAPI.voteOnDiscussion(discussionId, voteType);
      fetchDiscussions();
    } catch (error) {
      alert('Error voting: ' + error.message);
    }
  };

  const handleTogglePin = async (discussionId, currentPinStatus) => {
    try {
      await forumAPI.updateDiscussion(discussionId, { isPinned: !currentPinStatus });
      fetchDiscussions();
      alert(`Discussion ${!currentPinStatus ? 'pinned' : 'unpinned'} successfully!`);
    } catch (error) {
      alert('Error updating pin status: ' + error.message);
    }
  };

  const handleToggleLock = async (discussionId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'locked' ? 'active' : 'locked';
      await forumAPI.updateDiscussion(discussionId, { status: newStatus });
      fetchDiscussions();
      alert(`Discussion ${newStatus === 'locked' ? 'locked' : 'unlocked'} successfully!`);
    } catch (error) {
      alert('Error updating lock status: ' + error.message);
    }
  };

  const handleDeleteDiscussion = async (discussionId) => {
    if (window.confirm('Are you sure you want to delete this discussion?')) {
      try {
        await forumAPI.deleteDiscussion(discussionId);
        fetchDiscussions();
        alert('Discussion deleted successfully!');
      } catch (error) {
        alert('Error deleting discussion: ' + error.message);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNavigateToDiscussion = (discussionId) => {
    navigate(`/forum/${discussionId}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'discussions':
        return renderDiscussions();
      case 'moderation':
        return renderModeration();
      case 'stats':
        return renderStats();
      default:
        return renderDiscussions();
    }
  };

  const renderDiscussions = () => (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading discussions...</p>
        </div>
      ) : discussions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Discussions Found</h3>
          <p className="text-gray-600">Be the first to start a discussion in this community!</p>
        </div>
      ) : (
        discussions.map((discussion) => (
          <div
            key={discussion._id}
            className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer ${
              discussion.isPinned ? 'border-l-4 border-yellow-500' : ''
            } ${discussion.isOfficial ? 'border-l-4 border-green-500' : ''}`}
            onClick={() => handleNavigateToDiscussion(discussion._id)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center flex-wrap gap-2 mb-2">
                  {discussion.isPinned && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      📌 Pinned
                    </span>
                  )}
                  {discussion.isOfficial && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Star className="mr-1" size={12} />
                      Official Notice
                    </span>
                  )}
                  {discussion.status === 'resolved' && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <CheckCircle className="mr-1" size={12} />
                      Resolved
                    </span>
                  )}
                  {discussion.status === 'locked' && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Lock className="mr-1" size={12} />
                      Locked
                    </span>
                  )}
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {discussion.category}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-2 hover:text-blue-600">
                  {discussion.title}
                </h3>

                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <User className="mr-1" size={16} />
                  <span className="mr-4">{discussion.author?.fullName || 'Anonymous'}</span>
                  <Calendar className="mr-1" size={16} />
                  <span>{formatDate(discussion.createdAt)}</span>
                </div>

                {discussion.tags && discussion.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {discussion.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs flex items-center"
                      >
                        <Tag className="mr-1" size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between">
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(discussion._id, 'upvote');
                        }}
                        className="flex items-center space-x-1 hover:text-green-600"
                      >
                        <ThumbsUp size={16} />
                        <span>{discussion.upvotes?.length || 0}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(discussion._id, 'downvote');
                        }}
                        className="flex items-center space-x-1 hover:text-red-600"
                      >
                        <ThumbsDown size={16} />
                        <span>{discussion.downvotes?.length || 0}</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-1">
                      <MessageCircle size={16} />
                      <span>{discussion.replyCount || 0} replies</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Eye size={16} />
                      <span>{discussion.views || 0} views</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mt-2 md:mt-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePin(discussion._id, discussion.isPinned);
                      }}
                      className={`p-2 rounded-lg ${
                        discussion.isPinned 
                          ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={discussion.isPinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin size={16} />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLock(discussion._id, discussion.status);
                      }}
                      className={`p-2 rounded-lg ${
                        discussion.status === 'locked'
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={discussion.status === 'locked' ? 'Unlock' : 'Lock'}
                    >
                      <Lock size={16} />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDiscussion(discussion._id);
                      }}
                      className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderModeration = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Flag className="mr-2 text-red-500" />
          Reported Content
        </h3>
        <p className="text-gray-600">
          No reported content at this time. Reported discussions and replies will appear here for moderation.
        </p>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <MessageSquare className="text-blue-500 mr-3" size={24} />
            <div>
              <h3 className="text-2xl font-bold text-gray-800">0</h3>
              <p className="text-gray-600">Total Discussions</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <MessageCircle className="text-green-500 mr-3" size={24} />
            <div>
              <h3 className="text-2xl font-bold text-gray-800">0</h3>
              <p className="text-gray-600">Total Replies</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Flag className="text-red-500 mr-3" size={24} />
            <div>
              <h3 className="text-2xl font-bold text-gray-800">0</h3>
              <p className="text-gray-600">Reported Items</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Category Distribution</h3>
        <p className="text-gray-600">
          Category statistics will be displayed here.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="ml-64">
        <Navbar userData={userData} />
        {/* Fix padding to prevent content from being hidden under navbar */}
        <div className="bg-gray-50 p-6 pt-24 pb-20"> {/* Increased top padding */}
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <Shield className="mr-3 text-blue-600" />
                    Forum Management
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Moderate discussions, create official notices, and manage community engagement
                  </p>
                </div>
                <button
                  onClick={() => setShowNewDiscussion(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Plus className="mr-2" size={20} />
                  New Discussion
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('discussions')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'discussions'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <MessageSquare className="inline mr-2" size={16} />
                  Discussions
                </button>
                <button
                  onClick={() => setActiveTab('moderation')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'moderation'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Flag className="inline mr-2" size={16} />
                  Moderation
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'stats'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <BarChart3 className="inline mr-2" size={16} />
                  Statistics
                </button>
              </div>
            </div>

            {/* Filters and Search (only for discussions tab) */}
            {activeTab === 'discussions' && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search discussions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categoriesLoading ? (
                      <option disabled>Loading categories...</option>
                    ) : (
                      categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category._id} ({category.count})
                        </option>
                      ))
                    )}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                    <option value="most-replies">Most Replies</option>
                  </select>

                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('');
                      setSortBy('recent');
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}

            {/* Tab Content */}
            {renderTabContent()}

            {/* Pagination (only for discussions) */}
            {activeTab === 'discussions' && totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* New Discussion Modal */}
            {showNewDiscussion && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold mb-4">Create New Discussion</h2>
                  <form onSubmit={handleCreateDiscussion}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={newDiscussion.title}
                          onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter discussion title..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category *
                        </label>
                        <select
                          required
                          value={newDiscussion.category}
                          onChange={(e) => setNewDiscussion(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a category</option>
                          {categoriesLoading ? (
                            <option disabled>Loading categories...</option>
                          ) : (
                            categories.map((category) => (
                              <option key={category._id} value={category._id}>
                                {category._id}
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Content *
                        </label>
                        <textarea
                          required
                          rows={6}
                          value={newDiscussion.content}
                          onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Write your discussion content..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tags (optional)
                        </label>
                        <input
                          type="text"
                          value={newDiscussion.tags}
                          onChange={(e) => setNewDiscussion(prev => ({ ...prev, tags: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter tags separated by commas..."
                        />
                      </div>

                      {/* GS Officer Options */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isPinned"
                            checked={newDiscussion.isPinned}
                            onChange={(e) => setNewDiscussion(prev => ({ ...prev, isPinned: e.target.checked }))}
                            className="mr-2"
                          />
                          <label htmlFor="isPinned" className="text-sm font-medium text-gray-700">
                            📌 Pin this discussion
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isOfficial"
                            checked={newDiscussion.isOfficial}
                            onChange={(e) => setNewDiscussion(prev => ({ ...prev, isOfficial: e.target.checked }))}
                            className="mr-2"
                          />
                          <label htmlFor="isOfficial" className="text-sm font-medium text-gray-700">
                            ⭐ Mark as official notice
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowNewDiscussion(false)}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Create Discussion
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default GSForum;