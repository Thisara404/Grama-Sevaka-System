import { useState, useEffect } from 'react';
import { PlusIcon, PencilSquareIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Sidebar from '../../components/sidebar/gramasewaka.sidebar';
import Navbar from '../../components/navbar/gramasewaka.navbar';
import Footer from '../../components/footer/gramasewaka.footer';

const GSService = () => {
  const [userData, setUserData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionForm, setActionForm] = useState({
    notes: '',
    reason: '',
    information: '',
    completionDate: '',
    issueDate: ''
  });
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('requests');
  const [showCreateServiceForm, setShowCreateServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    category: '',
    codePrefix: '',
    processingTime: '',
    fees: {
      amount: 0,
      currency: 'LKR',
      details: ''
    },
    requiredDocuments: [{ name: '', description: '', isRequired: true }],
    eligibilityCriteria: '',
    instructions: '',
    icon: 'document-text',
    isActive: true
  });
  
  const serviceCategories = [
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

  // Get user data from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    
    if (activeTab === 'requests') {
      fetchRequests();
    } else if (activeTab === 'services') {
      fetchServices();
    }
  }, [statusFilter, activeTab]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/gs/pending-approvals?status=${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }
      
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchServices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/gs/services', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
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
  
  const handleRequestAction = async (id, action) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let endpoint;
      let requestBody = {};
      
      if (action === 'approve') {
        endpoint = `http://localhost:5000/api/gs/requests/${id}/approve`;
        requestBody = {
          notes: actionForm.notes,
          completionDate: actionForm.completionDate,
          issueDate: actionForm.issueDate
        };
      } else if (action === 'reject') {
        endpoint = `http://localhost:5000/api/gs/requests/${id}/reject`;
        requestBody = {
          reason: actionForm.reason
        };
      } else if (action === 'request-info') {
        endpoint = `http://localhost:5000/api/gs/requests/${id}/request-info`;
        requestBody = {
          information: actionForm.information
        };
      } else {
        endpoint = `http://localhost:5000/api/gs/requests/${id}/status`;
        requestBody = {
          status: action
        };
      }
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process request');
      }
      
      // Reset form and close modal
      setActionForm({
        notes: '',
        reason: '',
        information: '',
        completionDate: '',
        issueDate: ''
      });
      setActionType('');
      setShowDetails(false);
      
      // Refresh requests
      fetchRequests();
      
      setSuccessMessage(`Request ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'updated'} successfully!`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateOrUpdateService = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Create or update service
      const url = editingService 
        ? `http://localhost:5000/api/gs/services/${editingService._id}`
        : 'http://localhost:5000/api/gs/services';
      
      const method = editingService ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serviceForm)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save service');
      }
      
      // Reset form and state
      setServiceForm({
        name: '',
        description: '',
        category: '',
        codePrefix: '',
        processingTime: '',
        fees: {
          amount: 0,
          currency: 'LKR',
          details: ''
        },
        requiredDocuments: [{ name: '', description: '', isRequired: true }],
        eligibilityCriteria: '',
        instructions: '',
        icon: 'document-text',
        isActive: true
      });
      setShowCreateServiceForm(false);
      setEditingService(null);
      
      // Refresh services
      fetchServices();
      
      setSuccessMessage(`Service ${editingService ? 'updated' : 'created'} successfully!`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditService = (service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      description: service.description,
      category: service.category,
      codePrefix: service.codePrefix || '',
      processingTime: service.processingTime || '',
      fees: service.fees,
      requiredDocuments: service.requiredDocuments || [],
      eligibilityCriteria: service.eligibilityCriteria || '',
      instructions: service.instructions || '',
      icon: service.icon || 'document-text',
      isActive: service.isActive
    });
    setShowCreateServiceForm(true);
  };
  
  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service? This cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/gs/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete service');
      }
      
      // Refresh services
      fetchServices();
      
      setSuccessMessage('Service deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddDocument = () => {
    setServiceForm({
      ...serviceForm,
      requiredDocuments: [
        ...serviceForm.requiredDocuments,
        { name: '', description: '', isRequired: true }
      ]
    });
  };
  
  const handleRemoveDocument = (index) => {
    const updatedDocs = [...serviceForm.requiredDocuments];
    updatedDocs.splice(index, 1);
    setServiceForm({
      ...serviceForm,
      requiredDocuments: updatedDocs
    });
  };
  
  const handleDocumentChange = (index, field, value) => {
    const updatedDocs = [...serviceForm.requiredDocuments];
    updatedDocs[index] = {
      ...updatedDocs[index],
      [field]: value
    };
    setServiceForm({
      ...serviceForm,
      requiredDocuments: updatedDocs
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar userFullName={userData?.fullName} userRole="gs" />
        <main className="p-6 mt-16 mb-16">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-primary">Service Management</h1>
          </div>
          
          {/* Success message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`mr-8 py-4 px-1 ${
                    activeTab === 'requests'
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Service Requests
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`mr-8 py-4 px-1 ${
                    activeTab === 'services'
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Manage Services
                </button>
              </nav>
            </div>
          </div>
          
          {/* Service Requests Tab */}
          {activeTab === 'requests' && (
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Service Requests</h2>
                  <div className="flex space-x-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-review">In Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                      <option value="additional-info-required">Additional Info Required</option>
                    </select>
                  </div>
                </div>
                
                {/* Requests List */}
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
                    <p className="mt-1 text-sm text-gray-500">There are no service requests with the selected status.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Request ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Service
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Citizen
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Submitted On
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {requests.map((request) => (
                          <tr key={request._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {request.requestNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {request.service?.name || 'Unknown Service'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {request.user?.fullName || 'Unknown User'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                request.status === 'in-review' ? 'bg-blue-100 text-blue-800' :
                                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                request.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {request.status.replace(/-/g, ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowDetails(true);
                                }}
                                className="text-primary hover:text-secondary"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Manage Services Tab */}
          {activeTab === 'services' && (
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Available Services</h2>
                  <button
                    onClick={() => {
                      setEditingService(null);
                      setServiceForm({
                        name: '',
                        description: '',
                        category: '',
                        codePrefix: '',
                        processingTime: '',
                        fees: {
                          amount: 0,
                          currency: 'LKR',
                          details: ''
                        },
                        requiredDocuments: [{ name: '', description: '', isRequired: true }],
                        eligibilityCriteria: '',
                        instructions: '',
                        icon: 'document-text',
                        isActive: true
                      });
                      setShowCreateServiceForm(true);
                    }}
                    className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add New Service
                  </button>
                </div>
                
                {/* Services List */}
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : services.length === 0 ? (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new service.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Service Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Processing Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {services.map((service) => (
                          <tr key={service._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {service.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {service.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {service.processingTime || 'Not specified'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {service.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditService(service)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <PencilSquareIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteService(service._id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Service Create/Edit Form Modal */}
          {showCreateServiceForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">{editingService ? 'Edit Service' : 'Create New Service'}</h2>
                <form onSubmit={handleCreateOrUpdateService}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Name*</label>
                      <input
                        type="text"
                        required
                        value={serviceForm.name}
                        onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                      <select
                        required
                        value={serviceForm.category}
                        onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select a category</option>
                        {serviceCategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                    <textarea
                      required
                      rows={3}
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Code Prefix</label>
                      <input
                        type="text"
                        value={serviceForm.codePrefix}
                        onChange={(e) => setServiceForm({ ...serviceForm, codePrefix: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Processing Time</label>
                      <input
                        type="text"
                        placeholder="e.g., 3-5 working days"
                        value={serviceForm.processingTime}
                        onChange={(e) => setServiceForm({ ...serviceForm, processingTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fees</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <input
                          type="number"
                          placeholder="Amount"
                          value={serviceForm.fees.amount}
                          onChange={(e) => setServiceForm({ 
                            ...serviceForm, 
                            fees: { 
                              ...serviceForm.fees, 
                              amount: parseFloat(e.target.value) 
                            } 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <select
                          value={serviceForm.fees.currency}
                          onChange={(e) => setServiceForm({ 
                            ...serviceForm, 
                            fees: { 
                              ...serviceForm.fees, 
                              currency: e.target.value 
                            } 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="LKR">LKR</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Fee details"
                          value={serviceForm.fees.details}
                          onChange={(e) => setServiceForm({ 
                            ...serviceForm, 
                            fees: { 
                              ...serviceForm.fees, 
                              details: e.target.value 
                            } 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Required Documents</label>
                      <button
                        type="button"
                        onClick={handleAddDocument}
                        className="text-sm text-primary hover:text-secondary"
                      >
                        + Add Document
                      </button>
                    </div>
                    
                    {serviceForm.requiredDocuments.map((doc, index) => (
                      <div key={index} className="flex items-start space-x-2 mb-2 p-2 border border-gray-200 rounded-md">
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                            <input
                              type="text"
                              placeholder="Document name"
                              value={doc.name}
                              onChange={(e) => handleDocumentChange(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={doc.isRequired}
                                onChange={(e) => handleDocumentChange(index, 'isRequired', e.target.checked)}
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-700">Required</span>
                            </div>
                          </div>
                          <textarea
                            placeholder="Document description"
                            value={doc.description}
                            onChange={(e) => handleDocumentChange(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            rows={2}
                          ></textarea>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility Criteria</label>
                    <textarea
                      rows={3}
                      value={serviceForm.eligibilityCriteria}
                      onChange={(e) => setServiceForm({ ...serviceForm, eligibilityCriteria: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Who is eligible for this service"
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                    <textarea
                      rows={3}
                      value={serviceForm.instructions}
                      onChange={(e) => setServiceForm({ ...serviceForm, instructions: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Step-by-step instructions for the citizen"
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Active Status</label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={serviceForm.isActive}
                        onChange={(e) => setServiceForm({ ...serviceForm, isActive: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Service is active and available to citizens</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowCreateServiceForm(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
                    >
                      {editingService ? 'Update Service' : 'Create Service'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Request Details Modal */}
          {showDetails && selectedRequest && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">Service Request Details</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
                
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Request ID</p>
                      <p className="font-medium">{selectedRequest.requestNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className={`font-medium ${
                        selectedRequest.status === 'pending' ? 'text-yellow-600' :
                        selectedRequest.status === 'in-review' ? 'text-blue-600' :
                        selectedRequest.status === 'approved' ? 'text-green-600' :
                        selectedRequest.status === 'rejected' ? 'text-red-600' :
                        selectedRequest.status === 'completed' ? 'text-purple-600' :
                        'text-orange-600'
                      }`}>
                        {selectedRequest.status.replace(/-/g, ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Service</p>
                      <p className="font-medium">{selectedRequest.service?.name || 'Unknown Service'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium">{selectedRequest.service?.category || 'Unknown Category'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Citizen</p>
                      <p className="font-medium">{selectedRequest.user?.fullName || 'Unknown User'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <p className="font-medium">{selectedRequest.user?.phoneNumber || 'No phone number'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Submitted On</p>
                      <p className="font-medium">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                    </div>
                    {selectedRequest.assignedTo && (
                      <div>
                        <p className="text-sm text-gray-500">Assigned To</p>
                        <p className="font-medium">{selectedRequest.assignedTo.fullName || 'Unknown Officer'}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Additional Information */}
                {selectedRequest.additionalInfo && (
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-2">Additional Information</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                      {selectedRequest.additionalInfo}
                    </p>
                  </div>
                )}
                
                {/* Notes/Communication History */}
                {selectedRequest.notes && selectedRequest.notes.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-2">Communication History</h3>
                    <div className="space-y-3">
                      {selectedRequest.notes.map((note, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-md">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">
                              {note.addedBy === selectedRequest.user._id ? 'Citizen' : 'GS Officer'}
                            </span>
                            <span className="text-gray-500">
                              {new Date(note.date).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Documents */}
                {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-2">Attached Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedRequest.documents.map((doc, index) => (
                        <a
                          key={index}
                          href={doc.path}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                        >
                          <DocumentTextIcon className="h-5 w-5 text-gray-500 mr-2" />
                          <div>
                            <p className="font-medium text-primary">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(doc.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.status === 'pending' || selectedRequest.status === 'in-review' ? (
                      <>
                        <button
                          onClick={() => setActionType('approve')}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setActionType('reject')}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => setActionType('request-info')}
                          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                        >
                          Request Info
                        </button>
                      </>
                    ) : selectedRequest.status === 'additional-info-required' ? (
                      <button
                        onClick={() => setActionType('in-review')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Mark as In Review
                      </button>
                    ) : selectedRequest.status === 'approved' ? (
                      <button
                        onClick={() => setActionType('completed')}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                      >
                        Mark as Completed
                      </button>
                    ) : null}
                  </div>
                </div>
                
                {/* Action Forms */}
                {actionType === 'approve' && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <h3 className="font-medium text-gray-900 mb-3">Approve Request</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleRequestAction(selectedRequest._id, 'approve');
                    }}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes (Optional)
                        </label>
                        <textarea
                          value={actionForm.notes}
                          onChange={(e) => setActionForm({ ...actionForm, notes: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Add any notes for the citizen"
                        ></textarea>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estimated Completion Date
                          </label>
                          <input
                            type="date"
                            value={actionForm.completionDate}
                            onChange={(e) => setActionForm({ ...actionForm, completionDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Issue Date (if applicable)
                          </label>
                          <input
                            type="date"
                            value={actionForm.issueDate}
                            onChange={(e) => setActionForm({ ...actionForm, issueDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Approve Request
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                {actionType === 'reject' && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <h3 className="font-medium text-gray-900 mb-3">Reject Request</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleRequestAction(selectedRequest._id, 'reject');
                    }}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reason for Rejection*
                        </label>
                        <textarea
                          value={actionForm.reason}
                          onChange={(e) => setActionForm({ ...actionForm, reason: e.target.value })}
                          rows={3}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Provide reason for rejection"
                        ></textarea>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Reject Request
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                {actionType === 'request-info' && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <h3 className="font-medium text-gray-900 mb-3">Request Additional Information</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleRequestAction(selectedRequest._id, 'request-info');
                    }}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Information Needed*
                        </label>
                        <textarea
                          value={actionForm.information}
                          onChange={(e) => setActionForm({ ...actionForm, information: e.target.value })}
                          rows={3}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Specify what additional information is needed"
                        ></textarea>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                        >
                          Request Information
                        </button>
                      </div>
                    </form>
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

export default GSService;