import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MegaphoneIcon,
  CalendarIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import CitizenSidebar from '../../components/sidebar/citizen.sidebar';
import CitizenNavbar from '../../components/navbar/citizen.navbar';
// import { announcementAPI } from '../../api/services';
import { AnnouncementService } from '../../services/announcement.service';

const CitizenAnnouncements = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const categories = [
    'all',
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

  const priorities = ['all', 'low', 'medium', 'high', 'urgent'];
  
  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        isActive: true,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedPriority !== 'all' && { priority: selectedPriority })
      };

      // Use AnnouncementService instead of announcementAPI
      const response = await AnnouncementService.getAnnouncements(params);
      
      if (response && response.announcements) {
        setAnnouncements(response.announcements);
        setTotalPages(response.pages);
        setTotalCount(response.total);
      } else {
        setError('Failed to fetch announcements');
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError(err.message || 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [currentPage, searchTerm, selectedCategory, selectedPriority]);

  // Handle announcement click
  const handleAnnouncementClick = async (announcement) => {
    try {
      // Increment view count - use AnnouncementService
      await AnnouncementService.getAnnouncementById(announcement._id);
      // Navigate to detail page
      navigate(`/citizen/announcements/${announcement._id}`, { 
        state: { announcement: { ...announcement, viewCount: announcement.viewCount + 1 } }
      });
    } catch (err) {
      console.error('Failed to increment view count:', err);
      // Navigate anyway
      navigate(`/citizen/announcements/${announcement._id}`, { 
        state: { announcement }
      });
    }
  };

  // Get priority badge styles
  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return badges[priority] || badges.medium;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle search with debounce
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePriorityChange = (priority) => {
    setSelectedPriority(priority);
    setCurrentPage(1);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CitizenSidebar />
      
      <div className="ml-64 w-full flex flex-col">
        <CitizenNavbar />
        
        <main className="flex-1 overflow-auto p-6 mt-16 mb-16">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <MegaphoneIcon className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Community Announcements</h1>
              </div>
              <p className="text-gray-600">
                Stay updated with the latest announcements from your Grama Sevaka office
              </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search announcements..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="lg:w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Filter */}
                <div className="lg:w-36">
                  <select
                    value={selectedPriority}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>
                        {priority === 'all' ? 'All Priority' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results count */}
              {!loading && (
                <div className="mt-4 text-sm text-gray-600">
                  Showing {announcements.length} of {totalCount} announcements
                </div>
              )}
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Announcements</h3>
                <p className="text-red-600">{error}</p>
                <button
                  onClick={fetchAnnouncements}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : announcements.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <MegaphoneIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Announcements Found</h3>
                <p className="text-gray-600">
                  {searchTerm || selectedCategory !== 'all' || selectedPriority !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No announcements are currently available.'}
                </p>
              </div>
            ) : (
              <>
                {/* Announcements Grid */}
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement._id}
                      onClick={() => handleAnnouncementClick(announcement)}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(announcement.priority)}`}>
                              {announcement.priority?.toUpperCase()}
                            </span>
                            {announcement.isPinned && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                PINNED
                              </span>
                            )}
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              {announcement.category}
                            </span>
                          </div>

                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {announcement.title}
                          </h3>

                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {announcement.content}
                          </p>

                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              <span>{formatDate(announcement.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <EyeIcon className="h-4 w-4" />
                              <span>{announcement.viewCount || 0} views</span>
                            </div>
                            {announcement.endDate && (
                              <div className="flex items-center gap-1">
                                <ClockIcon className="h-4 w-4" />
                                <span>Until {formatDate(announcement.endDate)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CitizenAnnouncements;