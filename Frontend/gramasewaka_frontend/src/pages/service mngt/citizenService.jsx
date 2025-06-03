import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/sidebar/citizen.sidebar';
import Navbar from '../../components/navbar/citizen.navbar';
import Footer from '../../components/footer/citizen.footer';
import { 
  DocumentTextIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import ServiceFormSelector from '../../components/service-forms/ServiceFormSelector';

const CitizenService = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [services, setServices] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('services');
  const [selectedService, setSelectedService] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [applicationForm, setApplicationForm] = useState({
    serviceId: '',
    additionalInfo: '',
    documents: [],
    serviceSpecificData: {}
  });

  const categories = [
    'Certificates',
    'Verifications', 
    'Registration',
    'Permits',
    'Licenses',
    'Community Services',
    'Land Administration',
    'Social Welfare',
    'Other'
  ];

  useEffect(() => {
    // Get user data from localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    // Fetch services and user requests
    fetchServices();
    fetchMyRequests();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/services?active=true');
      
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      
      const data = await response.json();
      setServices(data.services || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/services/my-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch your requests');
      }
      
      const data = await response.json();
      setMyRequests(data.requests || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
      // Don't set error here to avoid disrupting the services view
    }
  };

  const handleApply = (service) => {
    setSelectedService(service);
    setApplicationForm({
      ...applicationForm,
      serviceId: service._id
    });
    setShowApplicationForm(true);
  };

  const handleFileChange = (e) => {
    setApplicationForm({
      ...applicationForm,
      documents: Array.from(e.target.files)
    });
  };

  // Handler for service-specific form data
  const handleFormDataChange = (data) => {
    setApplicationForm(prev => ({
      ...prev,
      serviceSpecificData: data
    }));
  };

  const handleSubmitApplication = async (e) => {
    if (e) e.preventDefault();
    
    try {
      setFormSubmitting(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Create form data object
      const formData = new FormData();
      formData.append('serviceId', applicationForm.serviceId);
      formData.append('additionalInfo', applicationForm.additionalInfo);
      
      // Add service-specific data if any
      if (Object.keys(applicationForm.serviceSpecificData).length > 0) {
        formData.append('serviceSpecificData', JSON.stringify(applicationForm.serviceSpecificData));
      }
      
      // Add files if any
      if (applicationForm.documents.length > 0) {
        applicationForm.documents.forEach(file => {
          formData.append('documents', file);
        });
      }
      
      // Submit the form
      const response = await fetch('http://localhost:5000/api/services/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit service request');
      }
      
      // Reset form and show success message
      setApplicationForm({
        serviceId: '',
        additionalInfo: '',
        documents: [],
        serviceSpecificData: {}
      });
      setSubmitSuccess(true);
      
      // Refresh requests after submission
      fetchMyRequests();
      
      // Hide form after 3 seconds
      setTimeout(() => {
        setShowApplicationForm(false);
        setSubmitSuccess(false);
      }, 3000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const filteredServices = services.filter(service => {
    // Filter by category
    if (categoryFilter !== 'all' && service.category !== categoryFilter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !service.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !service.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex min-h-screen bg-light">
      <Sidebar />
      <div className="ml-64 w-full">
        <Navbar userFullName={userData?.fullName} userRole="citizen" />
        <main className="p-6 mt-16 mb-16">
          <h1 className="text-2xl font-bold text-primary mb-6">Services</h1>
          
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
                  onClick={() => setActiveTab('services')}
                  className={`mr-8 py-4 px-1 ${
                    activeTab === 'services'
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Available Services
                </button>
                <button
                  onClick={() => {
                    setActiveTab('my-requests');
                    fetchMyRequests();
                  }}
                  className={`mr-8 py-4 px-1 ${
                    activeTab === 'my-requests'
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Requests
                </button>
              </nav>
            </div>
          </div>
          
          {/* Services Tab */}
          {activeTab === 'services' && (
            <>
              {/* Search and Filter */}
              <div className="mb-6 flex flex-wrap gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              {/* Service Cards */}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="text-center py-8">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try changing your search or filter criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map(service => (
                    <div key={service._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h2>
                        <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {service.category}
                          </span>
                          {service.processingTime && (
                            <span className="text-xs text-gray-500">
                              Processing: {service.processingTime}
                            </span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleApply(service)}
                          className="w-full flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
                        >
                          <PlusIcon className="w-5 h-5 mr-2" />
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Application Form */}
              {showApplicationForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                    {submitSuccess ? (
                      <div className="p-8 text-center">
                        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h2>
                        <p className="text-gray-600 mb-6">Your service request has been submitted successfully.</p>
                        <button
                          onClick={() => {
                            setShowApplicationForm(false);
                            setSubmitSuccess(false);
                            navigate('/citizen/service-requests');
                          }}
                          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
                        >
                          View My Requests
                        </button>
                      </div>
                    ) : (
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-bold text-primary">Apply for {selectedService?.name}</h2>
                          <button
                            onClick={() => setShowApplicationForm(false)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        </div>
                        
                        {error && (
                          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                            {error}
                          </div>
                        )}
                        
                        <ServiceFormSelector
                          serviceName={selectedService?.name}
                          onFormDataChange={handleFormDataChange}
                          onSubmit={handleSubmitApplication}
                          onCancel={() => setShowApplicationForm(false)}
                          isSubmitting={formSubmitting}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* My Requests Tab */}
          {activeTab === 'my-requests' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">My Service Requests</h2>
                <button
                  onClick={() => navigate('/citizen/service-request')}
                  className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create New Request
                </button>
              </div>
              
              {myRequests.length === 0 ? (
                <div className="text-center py-8">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
                  <p className="mt-1 text-sm text-gray-500">You haven't made any service requests yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myRequests.map(request => (
                    <div key={request._id} className="border rounded-lg p-6 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {request.service?.name || 'Service Request'}
                            </h3>
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(request.status)}`}>
                              {request.status.replace('-', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">Request #{request.requestNumber}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            <span>Submitted: {formatDate(request.createdAt)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/citizen/service-requests`)}
                          className="px-3 py-1 text-sm text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default CitizenService;