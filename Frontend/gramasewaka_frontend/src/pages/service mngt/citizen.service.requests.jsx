import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentTextIcon, ClockIcon, CheckCircleIcon, XCircleIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';
import Sidebar from '../../components/sidebar/citizen.sidebar';
import Navbar from '../../components/navbar/citizen.navbar';
import Footer from '../../components/footer/citizen.footer';

const CitizenServiceRequests = () => {
  const [userData, setUserData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [additionalInfoResponse, setAdditionalInfoResponse] = useState('');
  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Get user data from localStorage
  useEffect(() => {
    try {
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
        console.log('User data loaded:', parsedUserData);
      } else {
        console.warn('No user data found in localStorage');
      }
      
      // Fetch requests when component mounts
      fetchRequests();
    } catch (err) {
      console.error('Error in useEffect:', err);
      setError('Failed to initialize the page. Please refresh.');
    }
  }, [activeTab]); // Re-fetch when tab changes

  // Function to fetch service requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
    
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      console.log('Fetching service requests...');
    
      const response = await fetch('http://localhost:5000/api/services/my-requests', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    
      console.log('Response status:', response.status);
    
      if (!response.ok) {
        // Try to get more information about the error
        let errorText = 'Failed to fetch your service requests';
        try {
          const errorData = await response.json();
          errorText = errorData.message || errorText;
        } catch (e) {
          // If we can't parse the JSON, just use the default error text
        }
        throw new Error(errorText);
      }
      
      const data = await response.json();
      console.log('Fetched requests:', data);
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'additional-info-required': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter requests based on active tab
  const filteredRequests = requests.filter(request => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return ['pending', 'in-review'].includes(request.status);
    if (activeTab === 'action-required') return request.status === 'additional-info-required';
    if (activeTab === 'completed') return ['approved', 'completed', 'rejected'].includes(request.status);
    return true;
  });

  const handleAdditionalFileChange = (e) => {
    setAdditionalFiles(Array.from(e.target.files));
  };

  const handleSubmitAdditionalInfo = async (e) => {
    e.preventDefault();
    
    if (!selectedRequest || !additionalInfoResponse.trim()) {
      setError('Please provide the requested information');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const formData = new FormData();
      formData.append('additionalInfo', additionalInfoResponse);
      
      // Add any files if selected
      if (additionalFiles.length > 0) {
        additionalFiles.forEach(file => {
          formData.append('documents', file);
        });
      }
      
      const response = await fetch(`http://localhost:5000/api/services/requests/${selectedRequest._id}/additional-info`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit additional information');
      }
      
      // Reset form and close modal
      setAdditionalInfoResponse('');
      setAdditionalFiles([]);
      setShowDetails(false);
      
      // Refresh requests
      fetchRequests();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-light">
      <Sidebar />
      <div className="ml-64 w-full">
        <Navbar userFullName={userData?.fullName} userRole="citizen" />
        <main className="p-6 mt-16 mb-16">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-primary">My Service Requests</h1>
            <button
              onClick={() => navigate('/citizen/service-request')}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create New Request
            </button>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`mr-8 py-4 px-1 ${
                    activeTab === 'all'
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  All Requests
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`mr-8 py-4 px-1 ${
                    activeTab === 'pending'
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setActiveTab('action-required')}
                  className={`mr-8 py-4 px-1 ${
                    activeTab === 'action-required'
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Action Required
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`mr-8 py-4 px-1 ${
                    activeTab === 'completed'
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Completed
                </button>
              </nav>
            </div>
          </div>
          
          {/* Request List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                <p className="mt-2 text-gray-500">Loading your requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8">
                <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">No service requests found.</p>
                <button
                  onClick={() => navigate('/citizen/service-request')}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
                >
                  Create Your First Request
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map(request => (
                  <div key={request._id} className="border rounded-lg p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.service?.name || 'Service Request'}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(request.status)}`}>
                            {request.status.replace('-', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Request #{request.requestNumber}</p>
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          <span>Submitted: {formatDate(request.createdAt)}</span>
                        </div>
                        
                        {request.notes && request.notes.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700">Latest Note:</p>
                            <p className="text-sm text-gray-600">
                              {request.notes[request.notes.length - 1].content.substring(0, 100)}
                              {request.notes[request.notes.length - 1].content.length > 100 && '...'}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetails(true);
                          }}
                          className="flex items-center px-3 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
                        >
                          <EyeIcon className="w-4 h-4 mr-2" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Request Details Modal */}
          {showDetails && selectedRequest && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-primary">
                      Service Request Details
                    </h2>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>

                  {/* Request Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Request Information</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Request Number:</span>
                          <p className="text-sm text-gray-900">{selectedRequest.requestNumber}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Service:</span>
                          <p className="text-sm text-gray-900">{selectedRequest.service?.name}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Status:</span>
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(selectedRequest.status)}`}>
                            {selectedRequest.status.replace('-', ' ')}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Submitted:</span>
                          <p className="text-sm text-gray-900">{formatDate(selectedRequest.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Processing Information</h3>
                      <div className="space-y-3">
                        {selectedRequest.assignedTo && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Assigned Officer:</span>
                            <p className="text-sm text-gray-900">{selectedRequest.assignedTo.fullName || 'GS Officer'}</p>
                          </div>
                        )}
                        {selectedRequest.completionDate && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Estimated Completion:</span>
                            <p className="text-sm text-gray-900">{formatDate(selectedRequest.completionDate)}</p>
                          </div>
                        )}
                        {selectedRequest.issueDate && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Issue Date:</span>
                            <p className="text-sm text-gray-900">{formatDate(selectedRequest.issueDate)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  {selectedRequest.additionalInfo && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Information</h3>
                      <p className="text-sm text-gray-700">{selectedRequest.additionalInfo}</p>
                    </div>
                  )}

                  {/* Service Specific Data */}
                  {selectedRequest.serviceSpecificData && Object.keys(selectedRequest.serviceSpecificData).length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Form Details</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        {Object.entries(selectedRequest.serviceSpecificData).map(([key, value]) => (
                          value && typeof value !== 'object' && (
                            <div key={key} className="mb-2">
                              <span className="text-sm font-medium text-gray-700">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                              <span className="text-sm text-gray-900 ml-2">{value}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedRequest.notes && selectedRequest.notes.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Notes from GS Officer</h3>
                      <div className="space-y-3">
                        {selectedRequest.notes
                          .filter(note => note.isPublic)
                          .map((note, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-md">
                              <p className="text-sm text-gray-700">{note.content}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Added on {formatDate(note.addedAt)}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Uploaded Documents</h3>
                      <div className="space-y-2">
                        {selectedRequest.documents.map((doc, index) => (
                          <div key={index} className="flex items-center p-3 bg-gray-50 rounded-md">
                            <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                              <p className="text-xs text-gray-500">
                                Uploaded: {formatDate(doc.uploadDate)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Required */}
                  {selectedRequest.status === 'additional-info-required' && (
                    <div className="mt-6 p-4 bg-orange-50 rounded-md">
                      <h4 className="text-lg font-medium text-orange-800 mb-3">Additional Information Required</h4>
                      <p className="text-orange-700 mb-3">
                        The GS officer requires additional information to process your request.
                        Please review the notes above and provide the requested information.
                      </p>
                      
                      <form onSubmit={handleSubmitAdditionalInfo} className="mt-4">
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Your Response
                          </label>
                          <textarea
                            value={additionalInfoResponse}
                            onChange={(e) => setAdditionalInfoResponse(e.target.value)}
                            rows={4}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Provide the requested information here..."
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Additional Documents (if requested)
                          </label>
                          <input
                            type="file"
                            multiple
                            onChange={handleAdditionalFileChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-70"
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Additional Information'}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default CitizenServiceRequests;