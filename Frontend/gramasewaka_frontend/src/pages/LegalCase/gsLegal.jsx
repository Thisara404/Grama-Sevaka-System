import { useState, useEffect } from 'react';
import { 
  ScaleIcon, 
  DocumentTextIcon, 
  MapPinIcon, 
  UserIcon, 
  ExclamationTriangleIcon, 
  CalendarIcon, 
  ClockIcon,
  ArrowDownTrayIcon // Add this import for the download icon
} from '@heroicons/react/24/outline';
import GSSidebar from '../../components/sidebar/gramasewaka.sidebar';
import GSNavbar from '../../components/navbar/gramasewaka.navbar';
import GSFooter from '../../components/footer/gramasewaka.footer';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const GSLegalCase = () => {
  const [userData, setUserData] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: '',
    notes: '',
    priority: ''
  });

  const [appointmentData, setAppointmentData] = useState({
    date: '',
    timeSlot: '',
    notes: ''
  });
  
  const [availableTimeSlots, setAvailableTimeSlots] = useState([
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'
  ]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  const categories = [
    'Property Dispute',
    'Family Dispute', 
    'Noise Complaint',
    'Land Issues',
    'Neighborhood Dispute',
    'Other'
  ];

  const statuses = [
    'submitted',
    'under-review',
    'investigating', 
    'resolved',
    'closed'
  ];

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    fetchCases();
    fetchAppointments();
  }, [statusFilter, categoryFilter]);

  const fetchCases = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      
      const response = await fetch(`http://localhost:5000/api/legal-cases?${params}`, {
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

  // Fix the fetchAppointments function to properly handle the response data
  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get start and end dates for the current month
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      console.log('Fetching appointments from:', startDate, 'to:', endDate);
      
      const response = await fetch(
        `http://localhost:5000/api/legal-cases/appointments?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Appointment fetch error response:', errorText);
        throw new Error('Failed to fetch appointments');
      }
      
      const data = await response.json();
      console.log('Fetched appointment data:', data);
      setCalendarEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setCalendarEvents([]);
    }
  };

  // Update the handleStatusUpdate function
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    
    try {
      if (!selectedCase) {
        setError('No case selected');
        return;
      }
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/legal-cases/${selectedCase._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(statusUpdateData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }
      
      const data = await response.json();
      
      // Update the selected case with new status
      setSelectedCase(prev => ({
        ...prev,
        status: statusUpdateData.status,
        priority: statusUpdateData.priority || prev.priority,
        notes: data.case.notes
      }));
      
      // Refresh cases to get updated data
      fetchCases();
      
      // Close modal and reset form
      setShowStatusUpdate(false);
      setStatusUpdateData({
        status: '',
        notes: '',
        priority: ''
      });
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.message || 'Failed to update status');
      
      // Keep the modal open but show error
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  // Update the handleScheduleAppointment function
  const handleScheduleAppointment = async (e) => {
    e.preventDefault();
    
    try {
      if (!selectedCase) {
        setError('No case selected');
        return;
      }
      
      console.log('Scheduling appointment:', appointmentData);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/legal-cases/${selectedCase._id}/appointment`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: appointmentData.date,
          timeSlot: appointmentData.timeSlot,
          notes: appointmentData.notes
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to schedule appointment');
      }
      
      const data = await response.json();
      
      // Update the selected case with appointment info
      setSelectedCase(prev => ({
        ...prev,
        appointment: data.appointment,
        status: prev.status === 'submitted' ? 'under-review' : prev.status
      }));
      
      // Refresh calendar events
      fetchAppointments();
      
      // Close modal and reset form
      setShowAppointmentModal(false);
      setAppointmentData({
        date: '',
        timeSlot: '',
        notes: ''
      });
      
      alert('Appointment scheduled successfully!');
    } catch (err) {
      console.error('Error scheduling appointment:', err);
      setError(err.message || 'Failed to schedule appointment');
      
      // Keep the modal open but show error
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  const handleCalendarDateChange = (date) => {
    setSelectedCalendarDate(date);
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

  // Fix the hasAppointments function to safely check if calendarEvents is an array
  const hasAppointments = (date) => {
    if (!Array.isArray(calendarEvents)) return false;
    
    return calendarEvents.some(event => 
      new Date(event.date).toDateString() === date.toDateString()
    );
  };

  // Also fix the getAppointmentsForDate function for safety
  const getAppointmentsForDate = (date) => {
    if (!Array.isArray(calendarEvents)) return [];
    
    return calendarEvents.filter(event => 
      new Date(event.date).toDateString() === date.toDateString()
    );
  };

  // Updated handleDownloadEvidence function that handles absolute file paths
  const handleDownloadEvidence = (evidenceItem) => {
    try {
      console.log('Attempting to download evidence:', evidenceItem);
      
      if (!evidenceItem) {
        throw new Error('Evidence item is not defined');
      }
      
      // Determine the file path - try different properties that might exist
      let filePath = null;
      
      // For directly uploaded files (often when uploaded via FormData)
      if (evidenceItem.path) {
        filePath = evidenceItem.path;
      } 
      // For files with filePath property
      else if (evidenceItem.filePath) {
        filePath = evidenceItem.filePath;
      }
      
      // If we still don't have a path
      if (!filePath) {
        throw new Error('No valid file path found in evidence data');
      }
      
      // Get the filename - try different properties
      let fileName = 'evidence-file';
      if (evidenceItem.name) {
        fileName = evidenceItem.name;
      } else if (evidenceItem.fileName) {
        fileName = evidenceItem.fileName;
      } else if (filePath) {
        // Extract filename from path as last resort
        const pathParts = filePath.split(/[\/\\]/); // Split by both forward and backslashes
        fileName = pathParts[pathParts.length - 1];
      }
      
      // Create a request to download the file via the backend API
      // We'll need to make an API call to fetch the file instead of direct access
      const token = localStorage.getItem('token');
      
      // Use fetch to download the file
      fetch(`http://localhost:5000/api/legal-cases/${selectedCase._id}/evidence-download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          evidenceId: evidenceItem._id,
          filePath: filePath
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error downloading file');
        }
        return response.blob();
      })
      .then(blob => {
        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary <a> element to trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(err => {
        console.error('Error downloading file:', err);
        setError(`Failed to download file: ${err.message}`);
      });
      
      // Provide visual feedback that the download request was sent
      alert('Download request sent to server. The file should download shortly.');
      
    } catch (err) {
      console.error('Error opening evidence:', err);
      setError(`Failed to access evidence file: ${err.message}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-light">
      <GSSidebar />
      <div className="ml-64 w-full">
        <GSNavbar userFullName={userData?.fullName} userRole="gs" />
        <main className="p-6 mt-16 mb-16">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-primary">Legal Case Management</h1>
            <div className="flex space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Add this error notification near the top of your render function */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 rounded-md text-red-700">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p>{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-700 font-medium ml-auto">
                Dismiss
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cases List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Legal Cases</h2>
                
                {loading ? (
                  <div className="text-center py-8">Loading cases...</div>
                ) : cases.length === 0 ? (
                  <div className="text-center py-8">
                    <ScaleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No legal cases found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cases.map(caseItem => (
                      <div
                        key={caseItem._id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedCase?._id === caseItem._id 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:bg-gray-50'
                        }`}
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
                            <div className="flex items-center text-xs text-gray-500">
                              <UserIcon className="w-4 h-4 mr-1" />
                              <span>{caseItem.complainant?.fullName}</span>
                              <span className="ml-4">Case #{caseItem.caseNumber}</span>
                              <span className="ml-4">
                                {new Date(caseItem.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Case Details */}
            <div className="lg:col-span-1">
              {selectedCase ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-semibold text-primary">Case Details</h2>
                    {selectedCase.status !== 'resolved' && selectedCase.status !== 'closed' && (
                      <>
                        <button
                          onClick={() => setShowStatusUpdate(true)}
                          className="px-3 py-1 bg-primary text-white text-sm rounded-md hover:bg-secondary mr-2"
                        >
                          Update Status
                        </button>
                        <button
                          onClick={() => {
                            setAppointmentData({
                              date: '',
                              timeSlot: '',
                              notes: ''
                            });
                            setShowAppointmentModal(true);
                          }}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
                        >
                          Schedule Appointment
                        </button>
                      </>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">{selectedCase.title}</h3>
                      <div className="flex space-x-2 mb-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(selectedCase.status)}`}>
                          {selectedCase.status.replace('-', ' ')}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityBadgeClass(selectedCase.priority)}`}>
                          {selectedCase.priority}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Case Number</p>
                      <p className="font-medium">{selectedCase.caseNumber}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium">{selectedCase.category}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Complainant</p>
                      <p className="font-medium">{selectedCase.complainant?.fullName}</p>
                      <p className="text-sm text-gray-600">{selectedCase.complainant?.email}</p>
                      {selectedCase.complainant?.phoneNumber && (
                        <p className="text-sm text-gray-600">{selectedCase.complainant.phoneNumber}</p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-sm text-gray-700 mt-1">{selectedCase.description}</p>
                    </div>

                    {selectedCase.location?.address && (
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="text-sm text-gray-700 flex items-center">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          {selectedCase.location.address}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-gray-500">Filed On</p>
                      <p className="font-medium">{new Date(selectedCase.createdAt).toLocaleString()}</p>
                    </div>

                    {selectedCase.assignedTo && (
                      <div>
                        <p className="text-sm text-gray-500">Assigned To</p>
                        <p className="font-medium">{selectedCase.assignedTo.fullName}</p>
                      </div>
                    )}

                    {/* Notes */}
                    {selectedCase.notes && selectedCase.notes.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Notes</p>
                        <div className="space-y-2">
                          {selectedCase.notes.filter(note => note.isPublic).map((note, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-md">
                              <p className="text-sm text-gray-700">{note.content}</p>
                              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                <span>By: {note.addedBy?.fullName || 'System'}</span>
                                <span>{new Date(note.addedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Evidence Files Section */}
                    {selectedCase && selectedCase.evidence && selectedCase.evidence.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Evidence Files ({selectedCase.evidence.length})</p>
                        <div className="space-y-2">
                          {selectedCase.evidence.map((evidence, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                              <div className="flex items-center">
                                <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-2" />
                                <div>
                                  <p className="text-sm font-medium text-gray-700">
                                    {evidence.name || evidence.fileName || `File ${index + 1}`}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {evidence.type || evidence.fileType || 'Document'} 
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  console.log('Evidence item clicked:', evidence);
                                  handleDownloadEvidence(evidence);
                                }}
                                className="p-2 text-primary hover:text-secondary hover:bg-gray-100 rounded-full"
                                title="Download evidence"
                              >
                                <ArrowDownTrayIcon className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Update Modal */}
                  {showStatusUpdate && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Update Case Status</h3>
                        
                        <form onSubmit={handleStatusUpdate} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Status
                            </label>
                            <select
                              value={statusUpdateData.status}
                              onChange={(e) => setStatusUpdateData({...statusUpdateData, status: e.target.value})}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="">Select Status</option>
                              {statuses.map(status => (
                                <option key={status} value={status}>
                                  {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Priority
                            </label>
                            <select
                              value={statusUpdateData.priority}
                              onChange={(e) => setStatusUpdateData({...statusUpdateData, priority: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="">No Change</option>
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Notes
                            </label>
                            <textarea
                              value={statusUpdateData.notes}
                              onChange={(e) => setStatusUpdateData({...statusUpdateData, notes: e.target.value})}
                              rows={3}
                              placeholder="Add notes about this status update"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            ></textarea>
                          </div>

                          <div className="flex justify-end space-x-3">
                            <button
                              type="button"
                              onClick={() => setShowStatusUpdate(false)}
                              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
                            >
                              Update Status
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Appointment Modal */}
                  {showAppointmentModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Schedule Appointment</h3>
                        
                        <form onSubmit={handleScheduleAppointment} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Date
                            </label>
                            <input
                              type="date"
                              value={appointmentData.date}
                              onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})}
                              min={new Date().toISOString().split('T')[0]}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Time Slot
                            </label>
                            <select
                              value={appointmentData.timeSlot}
                              onChange={(e) => setAppointmentData({...appointmentData, timeSlot: e.target.value})}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="">Select a time slot</option>
                              {availableTimeSlots.map(slot => (
                                <option key={slot} value={slot}>{slot}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Notes
                            </label>
                            <textarea
                              value={appointmentData.notes}
                              onChange={(e) => setAppointmentData({...appointmentData, notes: e.target.value})}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="Additional information for the appointment"
                            ></textarea>
                          </div>
                          
                          <div className="flex justify-end space-x-3 pt-4">
                            <button
                              type="button"
                              onClick={() => setShowAppointmentModal(false)}
                              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
                            >
                              Schedule Appointment
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <ScaleIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Select a case to view details</p>
                </div>
              )}
            </div>
          </div>

          {/* Calendar Section */}
          <div className="lg:col-span-1">
            {/* Calendar for appointments */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Case Appointments
              </h2>
              
              <div className="calendar-container">
                <Calendar
                  onChange={handleCalendarDateChange}
                  value={selectedCalendarDate}
                  tileClassName={({ date, view }) => {
                    if (view === 'month') {
                      if (hasAppointments(date)) {
                        return 'has-appointments';
                      }
                    }
                    return null;
                  }}
                  tileContent={({ date, view }) => {
                    if (view === 'month') {
                      const dayAppointments = getAppointmentsForDate(date);
                      if (dayAppointments.length > 0) {
                        return (
                          <div className="flex flex-col items-center">
                            <div className="flex justify-center mt-1">
                              <div className="w-2 h-2 bg-primary rounded-full appointment-indicator"></div>
                            </div>
                            {dayAppointments.length > 1 && (
                              <div className="text-xs font-bold text-primary mt-0.5">
                                {dayAppointments.length}
                              </div>
                            )}
                          </div>
                        );
                      }
                    }
                    return null;
                  }}
                />
              </div>
              
              {/* Calendar Legend */}
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Legend:</h4>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-100 rounded mr-2"></div>
                    <span>Today</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
                    <span>Has Appointments</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    <span>Appointment</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Selected Date Appointments */}
            {selectedCalendarDate && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">
                  Appointments for {new Date(selectedCalendarDate).toLocaleDateString()}
                </h3>
                
                {getAppointmentsForDate(selectedCalendarDate).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No appointments scheduled for this date</p>
                ) : (
                  <div className="space-y-4">
                    {getAppointmentsForDate(selectedCalendarDate).map(appointment => (
                      <div key={appointment.caseId} className="border-l-4 border-primary p-3 bg-gray-50 rounded-r-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <span className="font-medium text-gray-900 mr-2">
                                {appointment.timeSlot}
                              </span>
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                appointment.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                appointment.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                appointment.priority === 'low' ? 'bg-green-100 text-green-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {appointment.priority}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-gray-900">{appointment.title}</p>
                            <p className="text-xs text-gray-500">{appointment.caseNumber}</p>
                            <p className="text-sm text-gray-600 mt-1">Complainant: {appointment.complainant}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
        <GSFooter />
      </div>
    </div>
  );
};

export default GSLegalCase;