import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { forumService } from '../../services/forum.service';
import Sidebar from '../../components/sidebar/citizen.sidebar';
import Navbar from '../../components/navbar/citizen.navbar';
import Footer from '../../components/footer/citizen.footer';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Eye, 
  Calendar,
  User,
  Tag,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const CitizenForum = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fallback categories in case API fails
  const fallbackCategories = [
    'Local Announcements',
    'Community Projects', 
    'Help & Support',
    'General Discussion',
    'Suggestions & Feedback',
    'Events & Activities',
    'Environmental Issues',
    'Infrastructure',
    'Education',
    'Health & Wellness',
    'Other'
  ];

  // New discussion form state
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  });

  useEffect(() => {
    // Get user data from localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    
    fetchDiscussions();
    fetchCategories();
  }, [currentPage, selectedCategory, sortBy, searchTerm]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      
      const params = {
        page: currentPage,
        limit: 10,
        category: selectedCategory,
        search: searchTerm,
        sort: sortBy
      };
      
      const response = await forumService.getDiscussions(params);
      setDiscussions(response.discussions || []);
      setTotalPages(response.pages || 1);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      setErrorMessage('Failed to load discussions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await forumService.getCategories();
      
      if (response && Array.isArray(response) && response.length > 0) {
        setCategories(response);
      } else {
        // Use fallback categories with consistent format
        const fallbackCategoriesWithCount = fallbackCategories.map(cat => 
          typeof cat === 'string' ? { _id: cat, count: 0 } : cat
        );
        setCategories(fallbackCategoriesWithCount);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Use fallback categories with consistent format
      const fallbackCategoriesWithCount = fallbackCategories.map(cat => 
        typeof cat === 'string' ? { _id: cat, count: 0 } : cat
      );
      setCategories(fallbackCategoriesWithCount);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      await forumService.createDiscussion(newDiscussion);
      setNewDiscussion({ title: '', content: '', category: '', tags: '' });
      setShowNewDiscussion(false);
      setSuccessMessage('Discussion created successfully!');
      fetchDiscussions();
    } catch (error) {
      console.error('Error creating discussion:', error);
      setErrorMessage(error.message || 'Failed to create discussion. Please try again.');
    }
  };

  const handleVote = async (discussionId, voteType) => {
    try {
      setErrorMessage('');
      await forumService.voteOnDiscussion(discussionId, voteType);
      fetchDiscussions();
    } catch (error) {
      console.error('Error voting:', error);
      setErrorMessage('Failed to record your vote. Please try again.');
    }
  };

  const handleNavigateToDiscussion = (discussionId) => {
    navigate(`/citizen/forum/${discussionId}`);
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

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('recent');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="ml-64">
        <Navbar userFullName={userData?.fullName} userRole="citizen" />
        {/* Fix padding to prevent content from being hidden under navbar */}
        <div className="bg-gray-50 p-6 pt-24 pb-20"> {/* Increased top padding */}
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <MessageSquare className="mr-3 text-blue-600" />
                    Community Forum
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Engage with your community, ask questions, and share information
                  </p>
                </div>
                <button
                  onClick={() => setShowNewDiscussion(true)}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors flex items-center"
                >
                  <Plus className="mr-2" size={20} />
                  New Discussion
                </button>
              </div>
            </div>

            {/* Error/Success Messages */}
            {errorMessage && (
              <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <AlertTriangle className="mr-2" size={20} />
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}
            
            {successMessage && (
              <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <CheckCircle className="mr-2" size={20} />
                  <span>{successMessage}</span>
                </div>
              </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search discussions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  disabled={categoriesLoading}
                >
                  <option value="">All Categories</option>
                  {categoriesLoading ? (
                    <option disabled>Loading categories...</option>
                  ) : categories.length > 0 ? (
                    categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category._id} ({category.count || 0})
                      </option>
                    ))
                  ) : (
                    fallbackCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))
                  )}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="most-replies">Most Replies</option>
                </select>

                {/* Clear Filters */}
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Discussions List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
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
                    }`}
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
                          {discussion.status === 'resolved' && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                              <CheckCircle className="mr-1" size={12} />
                              Resolved
                            </span>
                          )}
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {discussion.category}
                          </span>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-800 mb-2 hover:text-primary">
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

                          {discussion.latestReply && (
                            <div className="text-xs">
                              Last reply by {discussion.latestReply.author} •{' '}
                              {formatDate(discussion.latestReply.date)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
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
                  <h2 className="text-2xl font-bold mb-4">Start New Discussion</h2>
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                          disabled={categoriesLoading}
                        >
                          <option value="">Select a category</option>
                          {categoriesLoading ? (
                            <option disabled>Loading categories...</option>
                          ) : categories.length > 0 ? (
                            categories.map((category) => (
                              <option key={category._id} value={category._id}>
                                {category._id}
                              </option>
                            ))
                          ) : (
                            fallbackCategories.map((category) => (
                              <option key={category} value={category}>
                                {category}
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="Enter tags separated by commas..."
                        />
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
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
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

export default CitizenForum;