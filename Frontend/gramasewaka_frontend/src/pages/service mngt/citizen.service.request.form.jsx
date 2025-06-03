import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/sidebar/citizen.sidebar';
import Navbar from '../../components/navbar/citizen.navbar';
import Footer from '../../components/footer/citizen.footer';
import { 
  DocumentTextIcon, 
  ArrowUturnLeftIcon, 
  CheckCircleIcon,
  PaperClipIcon 
} from '@heroicons/react/24/outline';
import ServiceFormSelector from '../../components/service-forms/ServiceFormSelector';

const CitizenServiceRequest = () => {
  const [userData, setUserData] = useState(null);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [requestNumber, setRequestNumber] = useState('');
  const [formData, setFormData] = useState({
    additionalInfo: '',
    documents: []
  });
  const navigate = useNavigate();

  // Get user data from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    
    // Fetch service categories
    fetchCategories();
  }, []);

  // Fetch services when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchServices(selectedCategory);
    }
  }, [selectedCategory]);

  // Fetch service details when a service is selected
  useEffect(() => {
    if (selectedService) {
      fetchServiceDetails(selectedService);
    }
  }, [selectedService]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/services/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch service categories');
      }
      const data = await response.json();
      // Transform the data format if needed
      const formattedCategories = data.map(cat => cat._id);
      setCategories(formattedCategories);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async (category) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/services?category=${category}&active=true`);
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

  const fetchServiceDetails = async (serviceId) => {
    try {
      if (!serviceId || typeof serviceId !== 'string') {
        throw new Error('Invalid service ID');
      }
      
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/services/${serviceId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch service details');
      }
      const data = await response.json();
      setSelectedService(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching service details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedService(null);
  };

  const handleServiceSelect = (serviceId) => {
    // Make sure serviceId is a string, not an object
    if (typeof serviceId === 'object') {
      serviceId = serviceId._id;
    }
    setSelectedService(null); // Clear first to trigger useEffect
    setTimeout(() => fetchServiceDetails(serviceId), 0);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      documents: files
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedService) {
      setError('Please select a service');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Create form data object
      const requestFormData = new FormData();
      requestFormData.append('serviceId', selectedService._id);
      requestFormData.append('additionalInfo', formData.additionalInfo);
      
      // Add files if any
      if (formData.documents.length > 0) {
        formData.documents.forEach(file => {
          requestFormData.append('documents', file);
        });
      }
      
      // Send the request
      const response = await fetch('http://localhost:5000/api/services/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: requestFormData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit service request');
      }
      
      const data = await response.json();
      setSuccess(true);
      setRequestNumber(data.requestNumber);
      
      // Reset form data
      setFormData({
        additionalInfo: '',
        documents: []
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/citizen/services');
  };

  const handleViewRequests = () => {
    navigate('/citizen/service-requests');
  };

  return (
    <div className="flex min-h-screen bg-light">
      <Sidebar />
      <div className="ml-64 w-full">
        <Navbar userFullName={userData?.fullName} userRole="citizen" />
        <main className="p-6 mt-16 mb-16">
          {success ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Request Submitted Successfully!</h1>
              <p className="text-gray-600 mb-6">Your service request has been submitted with request number: <span className="font-semibold">{requestNumber}</span></p>
              <p className="text-gray-600 mb-8">We will process your request and get back to you soon. You can track the status of your request in the service requests section.</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleViewRequests}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
                >
                  View My Requests
                </button>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setSelectedService(null);
                    setSelectedCategory('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-primary">Request a Service</h1>
                <button
                  onClick={handleBack}
                  className="flex items-center text-gray-600 hover:text-primary"
                >
                  <ArrowUturnLeftIcon className="w-4 h-4 mr-1" />
                  Back to Services
                </button>
              </div>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Step 1: Select Category */}
                {!selectedCategory && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Step 1: Select Service Category</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {loading ? (
                        <div className="col-span-full flex justify-center p-8">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        </div>
                      ) : categories.length === 0 ? (
                        <div className="col-span-full text-center p-8">
                          <p className="text-gray-500">No service categories available.</p>
                        </div>
                      ) : (
                        categories.map(category => (
                          <button
                            key={category}
                            onClick={() => handleCategorySelect(category)}
                            className="p-4 border border-gray-200 rounded-lg hover:bg-cream hover:border-primary transition-colors text-left"
                          >
                            <h3 className="font-medium text-gray-800">{category}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Select to see available services
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
                
                {/* Step 2: Select Service */}
                {selectedCategory && !selectedService && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      Step 2: Select a Service from {selectedCategory}
                    </h2>
                    <div className="mb-4">
                      <button
                        onClick={() => setSelectedCategory('')}
                        className="text-primary hover:text-secondary flex items-center"
                      >
                        <ArrowUturnLeftIcon className="w-4 h-4 mr-1" />
                        Back to Categories
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {loading ? (
                        <div className="col-span-full flex justify-center p-8">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        </div>
                      ) : services.length === 0 ? (
                        <div className="col-span-full text-center p-8">
                          <p className="text-gray-500">No services available in this category.</p>
                        </div>
                      ) : (
                        services.map(service => (
                          <button
                            key={service._id}
                            onClick={() => handleServiceSelect(service._id)}
                            className="p-4 border border-gray-200 rounded-lg hover:bg-cream hover:border-primary transition-colors text-left"
                          >
                            <h3 className="font-medium text-gray-800">{service.name}</h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {service.description}
                            </p>
                            <div className="flex justify-between items-center mt-3">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {service.processingTime || 'Processing time varies'}
                              </span>
                              {service.fees && service.fees.amount > 0 && (
                                <span className="text-xs font-medium">
                                  {service.fees.amount} {service.fees.currency}
                                </span>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
                
                {/* Step 3: Service Details and Application Form */}
                {selectedService && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      {selectedService.name}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {selectedService.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Processing Time</h3>
                        <p className="text-gray-900">{selectedService.processingTime}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Fee</h3>
                        <p className="text-gray-900">
                          {selectedService.fees.amount} {selectedService.fees.currency}
                        </p>
                      </div>
                    </div>
                    
                    {selectedService.requiredDocuments && selectedService.requiredDocuments.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Required Documents</h3>
                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
                          {selectedService.requiredDocuments.map((doc, index) => (
                            <li key={index} className="mb-2">
                              <span className="font-medium">{doc.name}</span>
                              {doc.isRequired && <span className="text-red-500 ml-1">*</span>}
                              {doc.description && (
                                <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedService.eligibilityCriteria && (
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Eligibility Criteria</h3>
                        <div className="text-gray-600 whitespace-pre-line">
                          {selectedService.eligibilityCriteria}
                        </div>
                      </div>
                    )}
                    
                    {selectedService.instructions && (
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Instructions</h3>
                        <div className="text-gray-600 whitespace-pre-line">
                          {selectedService.instructions}
                        </div>
                      </div>
                    )}
                    
                    <div className="border-t pt-6 mt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Application Form</h3>
                      <form onSubmit={handleSubmit}>
                        {/* Use ServiceFormSelector if service requires special form */}
                        {selectedService.name && (
                          <ServiceFormSelector
                            serviceName={selectedService.name}
                            onFormDataChange={(data) => setFormData(prev => ({ ...prev, serviceSpecificData: data }))}
                            onSubmit={handleSubmit}
                            onCancel={() => setSelectedService(null)}
                            isSubmitting={submitting}
                          />
                        )}
                        
                        {/* Otherwise use generic form */}
                        {!selectedService.name && (
                          <>
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Additional Information
                              </label>
                              <textarea
                                value={formData.additionalInfo}
                                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none h-24"
                                placeholder="Enter any additional information or instructions here"
                              ></textarea>
                            </div>
                            
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Documents
                              </label>
                              <div className="border border-gray-300 rounded-md p-4">
                                <div className="flex items-center justify-center w-full">
                                  <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <div className="flex flex-col items-center justify-center pt-7">
                                      <PaperClipIcon className="w-8 h-8 text-gray-400" />
                                      <p className="pt-1 text-sm text-gray-600">
                                        Drag & drop files here or click to browse
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        Supported formats: PDF, JPG, PNG (Max: 5MB each)
                                      </p>
                                    </div>
                                    <input
                                      type="file"
                                      multiple
                                      onChange={handleFileChange}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                                
                                {formData.documents.length > 0 && (
                                  <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Selected files:</p>
                                    <ul className="space-y-2">
                                      {formData.documents.map((file, index) => (
                                        <li key={index} className="flex items-center text-sm text-gray-600">
                                          <DocumentTextIcon className="w-4 h-4 mr-2 text-gray-400" />
                                          {file.name}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex justify-end space-x-4 mt-6">
                              <button
                                type="button"
                                onClick={() => setSelectedService(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={submitting}
                                className={`px-4 py-2 rounded-md transition-colors flex items-center justify-center ${
                                  submitting ? 'bg-primary/70 text-white' : 'bg-primary text-white hover:bg-secondary'
                                }`}
                              >
                                {submitting && (
                                  <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8v8H4zm16 0a8 8 0 01-8 8v-8h8z"
                                    ></path>
                                  </svg>
                                )}
                                Submit Request
                              </button>
                            </div>
                          </>
                        )}
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default CitizenServiceRequest;