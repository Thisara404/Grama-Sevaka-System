import { useState, useEffect } from 'react';
import { CalendarIcon, ClockIcon, BuildingOfficeIcon, DocumentTextIcon, UserIcon } from '@heroicons/react/24/outline';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Sidebar from '../../components/sidebar/gramasewaka.sidebar';
import Navbar from '../../components/navbar/gramasewaka.navbar';
import Footer from '../../components/footer/gramasewaka.footer';

const AppointmentScreen = () => {
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
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

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
  }, []);

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
      
      // Refresh appointments
      const updatedResponse = await fetch('http://localhost:5000/api/appointments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setAppointments(updatedData.appointments);
      }
      
      // Reset form
      e.target.reset();
      setSelectedDate('');
      setAvailableSlots([]);
      
      // Show success message
      alert('Appointment booked successfully!');
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
      
      // Update the UI by removing the cancelled appointment
      setAppointments(appointments.map(apt => 
        apt._id === id ? { ...apt, status: 'cancelled' } : apt
      ));
      
      // Show success message
      alert('Appointment cancelled successfully');
    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    }
  };

  // Handle status change for appointment
  const handleStatusChange = async (id, newStatus, notesText = '') => {
    try {
      const statusData = { 
        status: newStatus
      };
      
      const response = await fetch(`http://localhost:5000/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(statusData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }
      
      // Update the UI
      setAppointments(appointments.map(apt => 
        apt._id === id ? { ...apt, status: newStatus } : apt
      ));
      
      // Show confirmation message
      alert(`Appointment ${newStatus === 'confirmed' ? 'confirmed' : 'updated to ' + newStatus}`);
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

  // Helper function to get appointments for a specific date
  const getAppointmentsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(appointment => 
      appointment.date.split('T')[0] === dateString && 
      ['confirmed', 'pending'].includes(appointment.status)
    );
  };

  // Helper function to check if date has appointments
  const hasAppointments = (date) => {
    return getAppointmentsForDate(date).length > 0;
  };

  // Helper function to get appointments for selected calendar date
  const getSelectedDateAppointments = () => {
    if (!selectedCalendarDate) return [];
    return getAppointmentsForDate(selectedCalendarDate);
  };

  // Handle calendar date selection
  const handleCalendarDateChange = (date) => {
    setSelectedCalendarDate(date);
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timeSlot) => {
    return timeSlot;
  };

  return (
    <div className="flex min-h-screen bg-light">
      <Sidebar />
      <div className="ml-64 w-full">
        <Navbar userFullName={userData?.fullName} userRole={userData?.role} />
        <main className="p-6 mt-16 mb-16">
          <h1 className="text-2xl font-bold text-primary mb-6">Appointments Management</h1>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left column - Calendar */}
            <div className="xl:col-span-1">
              {/* Calendar Statistics */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <h3 className="text-lg font-semibold text-primary mb-3">Today's Overview</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {getAppointmentsForDate(new Date()).length}
                    </div>
                    <div className="text-sm text-blue-800">Today's Appointments</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {appointments.filter(apt => apt.status === 'pending').length}
                    </div>
                    <div className="text-sm text-yellow-800">Pending Requests</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-primary mb-4 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Appointment Calendar
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
                    Appointments for {formatDate(selectedCalendarDate)}
                  </h3>
                  
                  {getSelectedDateAppointments().length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No appointments scheduled for this date</p>
                  ) : (
                    <div className="space-y-3">
                      {getSelectedDateAppointments().map((appointment) => (
                        <div key={appointment._id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="font-medium text-sm">{formatTime(appointment.timeSlot)}</span>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                          <div className="flex items-center mb-1">
                            <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium">{appointment.user?.fullName || 'Unknown User'}</span>
                          </div>
                          <p className="text-sm text-gray-600">{appointment.serviceType}</p>
                          <p className="text-xs text-gray-500 mt-1">{appointment.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Middle column - Appointment List */}
            <div className="xl:col-span-2">
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
                            {/* <h3 className="font-medium">{appointment.serviceType}</h3>
                            <p className="text-sm text-gray-600">{appointment.department}</p> */}
                            {/* Add citizen name display */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">{appointment.serviceType}</h3>
            <span className="text-sm font-medium text-primary">
              {appointment.user?.fullName || 'Unknown User'}
            </span>
          </div>
          <p className="text-sm text-gray-600">{appointment.department}</p>
          {/* Add citizen contact info */}
          <p className="text-xs text-gray-500">
            {appointment.user?.email} {appointment.user?.phoneNumber && `• ${appointment.user.phoneNumber}`}
          </p>
          <div className="flex items-center mt-1 text-sm text-gray-500">
            <CalendarIcon className="w-4 h-4 mr-1" />
            {new Date(appointment.date).toLocaleDateString()}
            <ClockIcon className="w-4 h-4 ml-3 mr-1" />
            {appointment.timeSlot}
          </div>
                            <div className="mt-2">
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                appointment.status === 'no-show' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Action buttons for upcoming appointments */}
                          {activeTab === 'upcoming' && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {appointment.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(appointment._id, 'confirmed')}
                                    className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-md hover:bg-green-200"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => handleCancelAppointment(appointment._id)}
                                    className="px-2 py-1 bg-red-50 text-red-600 text-sm rounded-md hover:bg-red-100"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {appointment.status === 'confirmed' && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(appointment._id, 'completed')}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md hover:bg-blue-200"
                                  >
                                    Complete
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(appointment._id, 'no-show')}
                                    className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-md hover:bg-purple-200"
                                  >
                                    No-Show
                                  </button>
                                  <button
                                    onClick={() => handleCancelAppointment(appointment._id)}
                                    className="px-2 py-1 bg-red-50 text-red-600 text-sm rounded-md hover:bg-red-100"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <p className="mt-2 text-sm text-gray-600">{appointment.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Right column - Create Appointment Form
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
            </div> */}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AppointmentScreen;