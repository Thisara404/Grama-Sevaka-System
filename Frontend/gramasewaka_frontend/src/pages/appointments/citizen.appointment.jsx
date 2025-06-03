import { useState, useEffect } from 'react';
import { CalendarIcon, ClockIcon, BuildingOfficeIcon, DocumentTextIcon, CheckIcon } from '@heroicons/react/24/outline';
import Sidebar from '../../components/sidebar/citizen.sidebar';
import Navbar from '../../components/navbar/citizen.navbar';
import Footer from '../../components/footer/citizen.footer';

const CitizenAppointmentScreen = () => {
  const [userData, setUserData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get user data from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  // Fetch appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/appointments', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch appointments');
        
        const data = await response.json();
        setAppointments(data.appointments);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
    
    // Clear success messages after 3 seconds
    const timer = setTimeout(() => {
      setBookingSuccess(false);
      setCancelSuccess(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [refreshTrigger]);

  // Fetch departments and service types
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch departments
        const deptResponse = await fetch('http://localhost:5000/api/appointments/departments');
        if (!deptResponse.ok) throw new Error('Failed to fetch departments');
        const deptData = await deptResponse.json();
        setDepartments(deptData);
        
        // Fetch service types
        const serviceResponse = await fetch('http://localhost:5000/api/appointments/services');
        if (!serviceResponse.ok) throw new Error('Failed to fetch service types');
        const serviceData = await serviceResponse.json();
        setServiceTypes(serviceData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  // Fetch available slots for selected date
  const checkAvailableSlots = async (date) => {
    if (!date) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/slots?date=${date}`);
      if (!response.ok) throw new Error('Failed to fetch available slots');
      
      const data = await response.json();
      setAvailableSlots(data.availableSlots);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle form submission for new appointment
  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    
    const formData = new FormData(e.target);
    const appointmentData = {
      serviceType: formData.get('serviceType'),
      department: formData.get('department'),
      date: formData.get('date'),
      timeSlot: formData.get('timeSlot'),
      description: formData.get('description')
    };
    
    try {
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create appointment');
      }
      
      // Reset form
      e.target.reset();
      setSelectedDate('');
      setAvailableSlots([]);
      
      // Show success message
      setBookingSuccess(true);
      
      // Refresh appointments list
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel appointment');
      }
      
      // Show success message
      setCancelSuccess(true);
      
      // Refresh appointments list
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    }
  };

  // Filter appointments by status based on active tab
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    
    if (activeTab === 'upcoming') {
      return appointmentDate >= today && 
             ['pending', 'confirmed'].includes(appointment.status);
    } else if (activeTab === 'past') {
      return appointmentDate < today || 
             ['completed', 'cancelled', 'no-show'].includes(appointment.status);
    }
    return true; // Show all if no tab is active
  });

  // Format date to display in a readable format
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'no-show': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-light">
      <Sidebar />
      <div className="ml-64 w-full">
        <Navbar userFullName={userData?.fullName} userRole={userData?.role} />
        <main className="p-6 mt-16 mb-16">
          <h1 className="text-2xl font-bold text-primary mb-6">My Appointments</h1>
          
          {bookingSuccess && (
            <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md flex items-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              Appointment booked successfully! You will receive a confirmation when the Grama Sevaka approves it.
            </div>
          )}
          
          {cancelSuccess && (
            <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md flex items-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              Appointment cancelled successfully.
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Appointment List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex border-b mb-4">
                  <button 
                    className={`px-4 py-2 ${activeTab === 'upcoming' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('upcoming')}
                  >
                    Upcoming Appointments
                  </button>
                  <button 
                    className={`px-4 py-2 ${activeTab === 'past' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('past')}
                  >
                    Past Appointments
                  </button>
                </div>
                
                {loading ? (
                  <p className="text-center py-4">Loading appointments...</p>
                ) : error ? (
                  <p className="text-center text-red-500 py-4">{error}</p>
                ) : filteredAppointments.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No appointments found</p>
                ) : (
                  <div className="divide-y">
                    {filteredAppointments.map((appointment) => (
                      <div key={appointment._id} className="py-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{appointment.serviceType}</h3>
                            <p className="text-sm text-gray-600">{appointment.department}</p>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              {formatDate(appointment.date)}
                              <ClockIcon className="w-4 h-4 ml-3 mr-1" />
                              {appointment.timeSlot}
                            </div>
                            <div className="mt-2">
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(appointment.status)}`}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </span>
                            </div>
                            
                            {appointment.status === 'pending' && (
                              <p className="text-sm text-gray-500 mt-2 italic">
                                Waiting for GS officer confirmation
                              </p>
                            )}
                          </div>
                          
                          {/* Action buttons for upcoming appointments */}
                          {activeTab === 'upcoming' && ['pending', 'confirmed'].includes(appointment.status) && (
                            <button
                              onClick={() => handleCancelAppointment(appointment._id)}
                              className="px-3 py-1 bg-red-50 text-red-600 text-sm rounded-md hover:bg-red-100"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                        
                        <p className="mt-2 text-sm text-gray-600">{appointment.description}</p>
                        
                        {appointment.notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded-md">
                            <p className="text-xs text-gray-500">Notes from GS officer:</p>
                            <p className="text-sm text-gray-700">{appointment.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Right column - Create Appointment Form */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-primary mb-4">Book New Appointment</h2>
                
                <form onSubmit={handleCreateAppointment}>
                  <div className="mb-4">
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <div className="relative">
                      <BuildingOfficeIcon className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
                      <select
                        id="department"
                        name="department"
                        required
                        className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">
                      Service Type
                    </label>
                    <div className="relative">
                      <DocumentTextIcon className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
                      <select
                        id="serviceType"
                        name="serviceType"
                        required
                        className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                      >
                        <option value="">Select Service</option>
                        {serviceTypes.map(service => (
                          <option key={service.id} value={service.id}>{service.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          checkAvailableSlots(e.target.value);
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700 mb-1">
                      Time Slot
                    </label>
                    <div className="relative">
                      <ClockIcon className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
                      <select
                        id="timeSlot"
                        name="timeSlot"
                        required
                        disabled={!selectedDate || availableSlots.length === 0}
                        className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100"
                      >
                        <option value="">Select Time Slot</option>
                        {availableSlots.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                    {selectedDate && availableSlots.length === 0 && (
                      <p className="mt-1 text-sm text-red-500">No available slots for selected date</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Purpose of Appointment
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      required
                      maxLength={500}
                      placeholder="Describe the purpose of your appointment"
                      className="w-full border rounded-md p-2 focus:ring-2 focus:ring-primary focus:border-primary"
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-secondary transition-colors disabled:opacity-70"
                  >
                    {formSubmitting ? 'Booking...' : 'Book Appointment'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default CitizenAppointmentScreen;