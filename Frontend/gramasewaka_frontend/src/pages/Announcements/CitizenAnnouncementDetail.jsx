import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  CalendarIcon,
  EyeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import CitizenSidebar from '../../components/sidebar/citizen.sidebar';
import CitizenNavbar from '../../components/navbar/citizen.navbar';
// import { announcementAPI } from '../../api/services';
import { AnnouncementService } from '../../services/announcement.service';

const CitizenAnnouncementDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [announcement, setAnnouncement] = useState(location.state?.announcement || null);
  const [loading, setLoading] = useState(!announcement);
  const [error, setError] = useState('');

  // Fetch announcement if not passed via state
  useEffect(() => {
    if (!announcement && id) {
      fetchAnnouncement();
    }
  }, [id, announcement]);
  
  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      // Use AnnouncementService instead of announcementAPI
      const response = await AnnouncementService.getAnnouncementById(id);
      
      if (response) {
        setAnnouncement(response);
        // Note: View count is already incremented by the backend
      } else {
        setError('Announcement not found');
      }
    } catch (err) {
      console.error('Error fetching announcement:', err);
      setError(err.message || 'Failed to fetch announcement');
    } finally {
      setLoading(false);
    }
  };

  // Get priority badge styles
  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'bg-gray-100 text-gray-800 border-gray-200',
      medium: 'bg-blue-100 text-blue-800 border-blue-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      urgent: 'bg-red-100 text-red-800 border-red-200'
    };
    return badges[priority] || badges.medium;
  };

  // Get priority icon
  const getPriorityIcon = (priority) => {
    if (priority === 'urgent' || priority === 'high') {
      return <ExclamationTriangleIcon className="h-4 w-4" />;
    }
    return null;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format content with line breaks
  const formatContent = (content) => {
    return content?.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <CitizenSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <CitizenNavbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="flex h-screen bg-gray-50">
        <CitizenSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <CitizenNavbar />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center max-w-md">
              <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {error || 'Announcement Not Found'}
              </h2>
              <p className="text-gray-600 mb-6">
                The announcement you're looking for doesn't exist or has been removed.
              </p>
              <button
                onClick={() => navigate('/citizen/announcements')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Announcements
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CitizenSidebar />
      
      <div className="ml-64 w-full flex flex-col">
        <CitizenNavbar />
        
        <main className="flex-1 overflow-auto p-6 mt-16 mb-16">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate('/citizen/announcements')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to Announcements</span>
            </button>

            {/* Announcement Detail */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityBadge(announcement.priority)}`}>
                      <div className="flex items-center gap-1">
                        {getPriorityIcon(announcement.priority)}
                        {announcement.priority?.toUpperCase()}
                      </div>
                    </span>
                    {announcement.isPinned && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-full text-sm font-medium">
                        PINNED
                      </span>
                    )}
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {announcement.title}
                </h1>

                {/* Meta Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <TagIcon className="h-4 w-4" />
                    <span>{announcement.category}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Published {formatDate(announcement.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <EyeIcon className="h-4 w-4" />
                    <span>{(announcement.viewCount || 0) + 1} views</span>
                  </div>

                  {announcement.endDate && (
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4" />
                      <span>Valid until {formatDate(announcement.endDate)}</span>
                    </div>
                  )}
                </div>

                {/* Author Information */}
                {announcement.author && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserIcon className="h-4 w-4" />
                      <span>Published by {announcement.author.name || 'Grama Sevaka Office'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="prose max-w-none">
                  <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                    {formatContent(announcement.content)}
                  </div>
                </div>

                {/* Target Audience */}
                {announcement.targetAudience && announcement.targetAudience !== 'all' && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Target Audience:</strong> {announcement.targetAudience}
                    </p>
                  </div>
                )}

                {/* Validity Period */}
                {announcement.startDate && announcement.endDate && (
                  <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Validity Period:</strong> {formatDate(announcement.startDate)} - {formatDate(announcement.endDate)}
                    </p>
                  </div>
                )}

                {/* Emergency Alert */}
                {(announcement.priority === 'urgent' || announcement.category === 'Emergency') && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                      <ExclamationTriangleIcon className="h-5 w-5" />
                      <strong>Important Notice</strong>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      This is an urgent announcement. Please read carefully and take necessary actions if applicable.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Last updated: {formatDate(announcement.updatedAt || announcement.createdAt)}
                  </span>
                  <span>
                    Announcement ID: {announcement._id}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => navigate('/citizen/announcements')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View More Announcements
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CitizenAnnouncementDetail;