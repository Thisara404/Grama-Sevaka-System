import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { forumService } from '../../services/forum.service';
// Layout components - will be imported conditionally based on user role
import GSSidebar from '../../components/sidebar/gramasewaka.sidebar';
import GSNavbar from '../../components/navbar/gramasewaka.navbar';
import GSFooter from '../../components/footer/gramasewaka.footer';
import CitizenSidebar from '../../components/sidebar/citizen.sidebar';
import CitizenNavbar from '../../components/navbar/citizen.navbar';
import CitizenFooter from '../../components/footer/citizen.footer';
import { 
  ArrowLeft,
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Eye, 
  Calendar,
  User,
  Tag,
  CheckCircle,
  Pin,
  Lock,
  Star,
  Reply,
  Edit,
  Trash2,
  Flag,
  Send,
  AlertTriangle
} from 'lucide-react';

const DiscussionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [discussion, setDiscussion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [newReply, setNewReply] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingReply, setEditingReply] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user role and ID from userData
  const userRole = userData?.role || 'citizen';
  const userId = userData?.id;
  
  useEffect(() => {
    // Get user data from localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    
    fetchDiscussion();
  }, [id]);

  const fetchDiscussion = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await forumService.getDiscussionById(id);
      setDiscussion(response.discussion);
      setReplies(response.replies || []);
    } catch (error) {
      console.error('Error fetching discussion:', error);
      setErrorMessage('Failed to load discussion. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteDiscussion = async (voteType) => {
    try {
      setErrorMessage('');
      await forumService.voteOnDiscussion(id, voteType);
      fetchDiscussion();
      setSuccessMessage('Vote recorded successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error voting:', error);
      setErrorMessage('Failed to record your vote. Please try again.');
    }
  };

  const handleVoteReply = async (replyId, voteType) => {
    try {
      setErrorMessage('');
      await forumService.voteOnReply(replyId, voteType);
      fetchDiscussion();
    } catch (error) {
      console.error('Error voting on reply:', error);
      setErrorMessage('Failed to record your vote. Please try again.');
    }
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) return;
    
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      const replyData = {
        content: newReply,
        parentReplyId: replyingTo
      };
      
      await forumService.addReply(id, replyData);
      setNewReply('');
      setReplyingTo(null);
      fetchDiscussion();
      setSuccessMessage('Reply added successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding reply:', error);
      setErrorMessage('Failed to post your reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditReply = async (replyId) => {
    if (!editContent.trim()) return;

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      await forumService.updateReply(replyId, { content: editContent });
      setEditingReply(null);
      setEditContent('');
      fetchDiscussion();
      setSuccessMessage('Reply updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating reply:', error);
      setErrorMessage('Failed to update your reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return;
    
    try {
      setErrorMessage('');
      await forumService.deleteReply(replyId);
      fetchDiscussion();
      setSuccessMessage('Reply deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting reply:', error);
      setErrorMessage('Failed to delete reply. Please try again.');
    }
  };

  const handleMarkSolution = async (replyId) => {
    try {
      setErrorMessage('');
      await forumService.markSolution(id, replyId);
      fetchDiscussion();
      setSuccessMessage('Reply marked as solution!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error marking solution:', error);
      setErrorMessage('Failed to mark reply as solution. Please try again.');
    }
  };

  const handleReportReply = async (replyId) => {
    const reason = prompt('Please provide a reason for reporting this reply:');
    if (!reason) return;
    
    try {
      setErrorMessage('');
      await forumService.reportReply(replyId, reason);
      setSuccessMessage('Reply reported successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error reporting reply:', error);
      setErrorMessage('Failed to report reply. Please try again.');
    }
  };
  
  const handleDeleteDiscussion = async () => {
    if (!window.confirm('Are you sure you want to delete this discussion?')) return;
    
    try {
      setErrorMessage('');
      await forumService.deleteDiscussion(id);
      setSuccessMessage('Discussion deleted successfully');
      setTimeout(() => {
        const baseUrl = userRole === 'gs' ? '/forum' : '/citizen/forum';
        navigate(baseUrl);
      }, 2000);
    } catch (error) {
      console.error('Error deleting discussion:', error);
      setErrorMessage('Failed to delete discussion. Please try again.');
    }
  };
  
  const handleTogglePin = async () => {
    if (userRole !== 'gs') return;
    
    try {
      setErrorMessage('');
      await forumService.updateDiscussion(id, { isPinned: !discussion.isPinned });
      fetchDiscussion();
      setSuccessMessage(`Discussion ${discussion.isPinned ? 'unpinned' : 'pinned'} successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error toggling pin status:', error);
      setErrorMessage('Failed to update pin status. Please try again.');
    }
  };
  
  const handleToggleLock = async () => {
    if (userRole !== 'gs') return;
    
    try {
      setErrorMessage('');
      const newStatus = discussion.status === 'locked' ? 'active' : 'locked';
      await forumService.updateDiscussion(id, { status: newStatus });
      fetchDiscussion();
      setSuccessMessage(`Discussion ${newStatus === 'locked' ? 'locked' : 'unlocked'} successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error toggling lock status:', error);
      setErrorMessage('Failed to update lock status. Please try again.');
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

  // Check if user can edit or delete a reply
  const canEditOrDelete = (authorId) => {
    return userRole === 'gs' || authorId === userId;
  };

  // Check if user can mark a reply as solution
  const canMarkSolution = () => {
    return userRole === 'gs' || discussion?.author?._id === userId;
  };
  
  // Check if user can delete the discussion
  const canDeleteDiscussion = () => {
    return userRole === 'gs' || discussion?.author?._id === userId;
  };
  
  // Check if user has GS privileges
  const hasGSPrivileges = () => {
    return userRole === 'gs';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading discussion...</p>
        </div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Discussion Not Found</h3>
          <button
            onClick={() => navigate(-1)}
            className="text-primary hover:text-secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Conditional layout components based on user role
  const isGS = userRole === 'gs';
  const Sidebar = isGS ? GSSidebar : CitizenSidebar;
  const Navbar = isGS ? GSNavbar : CitizenNavbar;
  const Footer = isGS ? GSFooter : CitizenFooter;
  
  // Base URL for navigation
  const baseUrl = isGS ? '/forum' : '/citizen/forum';

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="ml-64">
        <Navbar userFullName={userData?.fullName} userRole={userRole} />
        <div className="bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate(baseUrl)}
              className="mb-6 flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="mr-2" size={20} />
              Back to Forum
            </button>
            
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

            {/* Discussion */}
            <div className={`bg-white rounded-lg shadow-md p-6 mb-6 ${
              discussion.isPinned ? 'border-l-4 border-yellow-500' : ''
            } ${discussion.isOfficial ? 'border-l-4 border-green-500' : ''}`}>
              {/* Admin Action Buttons */}
              {(hasGSPrivileges() || canDeleteDiscussion()) && (
                <div className="flex justify-end space-x-2 mb-4">
                  {hasGSPrivileges() && (
                    <>
                      <button
                        onClick={handleTogglePin}
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
                        onClick={handleToggleLock}
                        className={`p-2 rounded-lg ${
                          discussion.status === 'locked'
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={discussion.status === 'locked' ? 'Unlock' : 'Lock'}
                      >
                        <Lock size={16} />
                      </button>
                    </>
                  )}
                  
                  {canDeleteDiscussion() && (
                    <button
                      onClick={handleDeleteDiscussion}
                      className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )}
              
              {/* Status Badges */}
              <div className="flex items-center space-x-2 mb-4">
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

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{discussion.title}</h1>

              {/* Author and Date */}
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <User className="mr-1" size={16} />
                <span className="mr-4">{discussion.author?.fullName || 'Anonymous'}</span>
                <Calendar className="mr-1" size={16} />
                <span className="mr-4">{formatDate(discussion.createdAt)}</span>
                <Eye className="mr-1" size={16} />
                <span>{discussion.views || 0} views</span>
              </div>

              {/* Tags */}
              {discussion.tags && discussion.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
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

              {/* Content */}
              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {discussion.content}
                </p>
              </div>

              {/* Voting */}
              <div className="flex items-center space-x-4 border-t pt-4">
                <button
                  onClick={() => handleVoteDiscussion('upvote')}
                  className="flex items-center space-x-1 text-gray-600 hover:text-green-600"
                >
                  <ThumbsUp size={20} />
                  <span>{discussion.upvotes?.length || 0}</span>
                </button>
                <button
                  onClick={() => handleVoteDiscussion('downvote')}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                >
                  <ThumbsDown size={20} />
                  <span>{discussion.downvotes?.length || 0}</span>
                </button>
                <div className="flex items-center space-x-1 text-gray-600">
                  <MessageCircle size={20} />
                  <span>{replies.length} replies</span>
                </div>
              </div>
            </div>

            {/* Replies Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Replies ({replies.length})
              </h2>

              {/* Add Reply Form (if not locked) */}
              {discussion.status !== 'locked' && (
                <form onSubmit={handleAddReply} className="mb-6">
                  <div className="mb-4">
                    {replyingTo && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-700">
                            Replying to a comment
                          </span>
                          <button
                            type="button"
                            onClick={() => setReplyingTo(null)}
                            className="text-blue-700 hover:text-blue-900"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                    <textarea
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      placeholder="Write your reply..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newReply.trim() || isSubmitting}
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <Send className="mr-2" size={16} />
                      )}
                      Post Reply
                    </button>
                  </div>
                </form>
              )}

              {/* Replies List */}
              <div className="space-y-4">
                {replies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="mx-auto mb-4" size={48} />
                    <p>No replies yet. Be the first to reply!</p>
                  </div>
                ) : (
                  replies.map((reply) => (
                    <div
                      key={reply._id}
                      className={`border-l-2 pl-4 py-4 ${
                        reply.isSolution ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      } ${reply.parentReply ? 'ml-8' : ''}`}
                    >
                      {reply.isSolution && (
                        <div className="flex items-center text-green-700 text-sm font-medium mb-2">
                          <CheckCircle className="mr-1" size={16} />
                          Marked as Solution
                        </div>
                      )}

                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <User className="mr-1" size={14} />
                            <span className="mr-3">{reply.author?.fullName || 'Anonymous'}</span>
                            <Calendar className="mr-1" size={14} />
                            <span>{formatDate(reply.createdAt)}</span>
                            {reply.isEdited && (
                              <span className="ml-2 text-xs text-gray-500">(edited)</span>
                            )}
                          </div>

                          {editingReply === reply._id ? (
                            <div className="space-y-3">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditReply(reply._id)}
                                  disabled={isSubmitting}
                                  className="px-4 py-1 bg-primary text-white rounded hover:bg-secondary text-sm disabled:opacity-50 flex items-center"
                                >
                                  {isSubmitting && (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                                  )}
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingReply(null);
                                    setEditContent('');
                                  }}
                                  disabled={isSubmitting}
                                  className="px-4 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                              {reply.content}
                            </p>
                          )}

                          <div className="flex items-center space-x-4 text-sm">
                            <button
                              onClick={() => handleVoteReply(reply._id, 'upvote')}
                              className="flex items-center space-x-1 text-gray-600 hover:text-green-600"
                            >
                              <ThumbsUp size={16} />
                              <span>{reply.upvotes?.length || 0}</span>
                            </button>
                            <button
                              onClick={() => handleVoteReply(reply._id, 'downvote')}
                              className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                            >
                              <ThumbsDown size={16} />
                              <span>{reply.downvotes?.length || 0}</span>
                            </button>
                            {discussion.status !== 'locked' && (
                              <button
                                onClick={() => setReplyingTo(reply._id)}
                                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
                              >
                                <Reply size={16} />
                                Reply
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Reply Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {canMarkSolution() && !reply.isSolution && discussion.status !== 'resolved' && (
                            <button
                              onClick={() => handleMarkSolution(reply._id)}
                              className="p-1 text-gray-600 hover:text-green-600"
                              title="Mark as solution"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          
                          {canEditOrDelete(reply.author?._id) && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingReply(reply._id);
                                  setEditContent(reply.content);
                                }}
                                className="p-1 text-gray-600 hover:text-blue-600"
                                title="Edit reply"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteReply(reply._id)}
                                className="p-1 text-gray-600 hover:text-red-600"
                                title="Delete reply"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                            <button
                            onClick={() => handleReportReply(reply._id)}
                            className="p-1 text-gray-600 hover:text-yellow-600"
                            title="Report reply"
                          >
                            <Flag size={16} />                          </button>
                        </div>
                      </div>
                    </div>
                  ))
            )}
          </div>
        </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default DiscussionDetail;
