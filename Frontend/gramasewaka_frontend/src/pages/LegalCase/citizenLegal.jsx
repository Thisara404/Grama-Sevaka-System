import { useState, useEffect } from 'react';
import { ScaleIcon, DocumentTextIcon, MapPinIcon, ExclamationTriangleIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import CitizenSidebar from '../../components/sidebar/citizen.sidebar';
import CitizenNavbar from '../../components/navbar/citizen.navbar';
import CitizenFooter from '../../components/footer/citizen.footer';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CitizenLegalCase = () => {
  const [userData, setUserData] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileError, setFileError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    location: {
      address: '',
      coordinates: null
    }
  });

  const categories = [
    'Property Dispute',
    'Family Dispute', 
    'Noise Complaint',
    'Land Issues',
    'Neighborhood Dispute',
    'Other'
  ];

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/legal-cases/my-cases', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch cases');
      
      const data = await response.json();
      setCases(data.cases);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      // Create form data to handle files
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('category', formData.category);
      formDataObj.append('priority', formData.priority);
      
      if (formData.location.address) {
        formDataObj.append('location[address]', formData.location.address);
      }
      
      // Add files if any
      if (selectedFiles.length > 0) {
        selectedFiles.forEach(file => {
          formDataObj.append('evidence', file);
        });
      }
      
      const response = await fetch('http://localhost:5000/api/legal-cases', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataObj
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit case');
      }

      const result = await response.json();
      setSubmitSuccess(true);
      setShowForm(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        location: { address: '', coordinates: null }
      });
      setSelectedFiles([]);
      
      // Refresh cases
      fetchCases();
      
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types (PDF only)
    const invalidFiles = files.filter(file => 
      file.type !== 'application/pdf'
    );
    
    if (invalidFiles.length > 0) {
      setFileError('Only PDF files are allowed');
      return;
    }
    
    // Validate file size (max 5MB each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    
    if (oversizedFiles.length > 0) {
      setFileError('Each file must be less than 5MB');
      return;
    }
    
    setSelectedFiles(files);
    setFileError('');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under-review': return 'bg-yellow-100 text-yellow-800';
      case 'investigating': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCases = cases.filter(caseItem => {
    if (activeTab === 'all') return true;
    return caseItem.status === activeTab;
  });

  const handleCancelAppointment = async (caseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/legal-cases/${caseId}/appointment/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'Cancelled by citizen' })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel appointment');
      }
      
      // Update the selected case
      setSelectedCase(prev => ({
        ...prev,
        appointment: {
          ...prev.appointment,
          status: 'cancelled'
        }
      }));
      
      alert('Appointment cancelled successfully');
      
      // Refresh cases to get updated data
      fetchCases();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-light">
      <CitizenSidebar />
      <div className="ml-64 w-full">
        <CitizenNavbar userFullName={userData?.fullName} userRole="citizen" />
        <main className="p-6 mt-16 mb-16">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-primary">Legal Cases</h1>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
            >
              <ScaleIcon className="w-5 h-5 mr-2" />
              File New Case
            </button>
          </div>

          {submitSuccess && (
            <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
              Legal case submitted successfully! You will receive updates on its progress.
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Case Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-primary">File New Legal Case</h2>
                    <button
                      onClick={() => setShowForm(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Case Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        maxLength={200}
                        placeholder="Brief title describing the legal issue"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={5}
                        maxLength={2000}
                        placeholder="Detailed description of the legal issue, including relevant facts and circumstances"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location (Optional)
                      </label>
                      <input
                        type="text"
                        name="location.address"
                        value={formData.location.address}
                        onChange={handleChange}
                        placeholder="Address or location where the issue occurred"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Supporting Evidence (PDF only)
                      </label>
                      <input
                        type="file"
                        multiple
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                      {fileError && <p className="text-red-500 text-xs mt-1">{fileError}</p>}
                      {selectedFiles.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700">Selected files:</p>
                          <ul className="text-sm text-gray-600">
                            {selectedFiles.map((file, index) => (
                              <li key={index} className="flex items-center">
                                <DocumentTextIcon className="w-4 h-4 mr-2" />
                                {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-md">
                      <div className="flex">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-yellow-700 text-sm">
                          <strong>Important:</strong> Provide accurate and truthful information. False statements may have legal consequences. This case will be reviewed by the Grama Sevaka officer.
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        disabled={formSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-white rounded-md hover:bg-secondary"
                        disabled={formSubmitting}
                      >
                        {formSubmitting ? 'Submitting...' : 'Submit Case'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Cases List */}
          <div className="bg-white rounded-lg shadow-md">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {['all', 'submitted', 'under-review', 'investigating', 'resolved'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </nav>
            </div>

            {/* Cases Content */}
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">Loading cases...</div>
              ) : filteredCases.length === 0 ? (
                <div className="text-center py-8">
                  <ScaleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No legal cases found.</p>
                  <p className="text-gray-400 text-sm mt-2">
                    File a new case to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCases.map(caseItem => (
                    <div
                      key={caseItem._id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedCase(caseItem)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-gray-900">{caseItem.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(caseItem.status)}`}>
                              {caseItem.status.replace('-', ' ')}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityBadgeClass(caseItem.priority)}`}>
                              {caseItem.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{caseItem.category}</p>
                          <p className="text-sm text-gray-500 line-clamp-2">{caseItem.description}</p>
                          <div className="flex items-center mt-2 text-xs text-gray-400">
                            <DocumentTextIcon className="w-4 h-4 mr-1" />
                            <span>Case #{caseItem.caseNumber}</span>
                            <span className="ml-4">
                              Filed: {new Date(caseItem.createdAt).toLocaleDateString()}
                            </span>
                            {caseItem.assignedTo && (
                              <span className="ml-4">
                                Assigned to: {caseItem.assignedTo.fullName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Display appointment information if it exists */}
                      {caseItem.appointment && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-md">
                          <h4 className="text-sm font-medium text-blue-900 mb-2">Scheduled Appointment</h4>
                          <div className="flex items-center mb-2">
                            <CalendarIcon className="w-4 h-4 text-blue-500 mr-2" />
                            <span className="text-sm">{new Date(caseItem.appointment.date).toLocaleDateString()}</span>
                            <ClockIcon className="w-4 h-4 text-blue-500 ml-4 mr-2" />
                            <span className="text-sm">{caseItem.appointment.timeSlot}</span>
                          </div>
                          {caseItem.appointment.notes && (
                            <p className="text-xs text-gray-600 mt-1">{caseItem.appointment.notes}</p>
                          )}
                          {caseItem.appointment.status === 'confirmed' && (
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to cancel this appointment?')) {
                                  handleCancelAppointment(caseItem._id);
                                }
                              }}
                              className="mt-2 px-3 py-1 bg-red-50 text-red-600 text-xs rounded-md hover:bg-red-100"
                            >
                              Cancel Appointment
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
        <CitizenFooter />
      </div>
    </div>
  );
};

export default CitizenLegalCase;