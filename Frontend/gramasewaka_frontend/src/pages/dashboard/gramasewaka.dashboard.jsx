import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Sidebar from '../../components/sidebar/gramasewaka.sidebar';
import Navbar from '../../components/navbar/gramasewaka.navbar';
import Footer from '../../components/footer/gramasewaka.footer';
import GISMapping from '../../pages/gis & mapping/gis.mapping.gramasewaka';
import { MapIcon, BellAlertIcon, CalendarIcon, MapPinIcon, ClockIcon, UserIcon, ChartBarIcon, DocumentTextIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [emergencyReports, setEmergencyReports] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'meeting',
    priority: 'medium'
  });
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get user data from local storage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch appointments
      const appointmentResponse = await fetch('http://localhost:5000/api/appointments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (appointmentResponse.ok) {
        const appointmentData = await appointmentResponse.json();
        setAppointments(appointmentData.appointments || []);
      }

      // Fetch emergency reports
      const emergencyResponse = await fetch('http://localhost:5000/api/emergency', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (emergencyResponse.ok) {
        const emergencyData = await emergencyResponse.json();
        setEmergencyReports(emergencyData || []);
      }

      // Fetch custom events
      fetchEvents();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      // For now, we'll store events in localStorage
      // In a real application, this would be an API call
      const storedEvents = localStorage.getItem('gramasewaka_events');
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    
    const newEvent = {
      id: Date.now().toString(),
      ...eventFormData,
      createdAt: new Date().toISOString(),
      createdBy: userData?.fullName || 'Grama Sevaka'
    };

    try {
      // For now, we'll store in localStorage
      // In a real application, this would be an API call
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      localStorage.setItem('gramasewaka_events', JSON.stringify(updatedEvents));
      
      // Reset form and close modal
      setEventFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        type: 'meeting',
        priority: 'medium'
      });
      setShowAddEventModal(false);
      
      // Show success message
      alert('Event added successfully!');
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Error adding event. Please try again.');
    }
  };

  const handleDeleteEvent = (eventId) => {
    if (confirm('Are you sure you want to delete this event?')) {
      const updatedEvents = events.filter(event => event.id !== eventId);
      setEvents(updatedEvents);
      localStorage.setItem('gramasewaka_events', JSON.stringify(updatedEvents));
    }
  };
  
  const handleNavigate = (path) => {
    navigate(path);
  };

  // Helper functions for calendar
  const getAppointmentsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(appointment => 
      appointment.date.split('T')[0] === dateString && 
      ['confirmed', 'pending'].includes(appointment.status)
    );
  };

  const getEventsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const getAllEventsForDate = (date) => {
    const appointments = getAppointmentsForDate(date);
    const customEvents = getEventsForDate(date);
    return [...appointments, ...customEvents];
  };

  const hasAppointments = (date) => {
    return getAllEventsForDate(date).length > 0;
  };

  const getSelectedDateAppointments = () => {
    if (!selectedCalendarDate) return [];
    return getAllEventsForDate(selectedCalendarDate);
  };

  const handleCalendarDateChange = (date) => {
    setSelectedCalendarDate(date);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeSlot) => {
    return timeSlot;
  };

  // Get today's statistics
  const todayAppointments = getAppointmentsForDate(new Date());
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const activeEmergencies = emergencyReports.filter(report => 
    ['pending', 'in-progress'].includes(report.status)
  );
  
  return (
    <div className="flex min-h-screen bg-light">
      <Sidebar />
      <div className="ml-64 w-full">
        <Navbar userFullName={userData?.fullName} userRole={userData?.role} />
        <main className="p-6 mt-16 mb-16">
          {/* Welcome Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-primary">
                  Welcome back, {userData?.fullName || 'Grama Sevaka'}!
                </h1>
                <p className="text-gray-600 mt-1">
                  Ready to serve your community today
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Today</p>
                <p className="text-lg font-semibold text-primary">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            {/* Daily Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CalendarIcon className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{todayAppointments.length}</p>
                    <p className="text-blue-800 font-medium text-sm">Today's Appointments</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <ClockIcon className="w-8 h-8 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{pendingAppointments.length}</p>
                    <p className="text-yellow-800 font-medium text-sm">Pending Requests</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <BellAlertIcon className="w-8 h-8 text-red-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-red-600">{activeEmergencies.length}</p>
                    <p className="text-red-800 font-medium text-sm">Active Emergencies</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <ChartBarIcon className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-green-600">{appointments.length}</p>
                    <p className="text-green-800 font-medium text-sm">Total Appointments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            {/* Left Column - Calendar */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-primary flex items-center">
                    <CalendarIcon className="w-5 h-5 mr-2" />
                    Upcoming Events Calendar
                  </h2>
                  <button
                    onClick={() => setShowAddEventModal(true)}
                    className="bg-primary text-white px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-sm flex items-center"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Add Event
                  </button>
                </div>
                
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
                        const dayEvents = getAllEventsForDate(date);
                        if (dayEvents.length > 0) {
                          return (
                            <div className="flex flex-col items-center">
                              <div className="flex justify-center mt-1">
                                <div className="w-2 h-2 bg-primary rounded-full appointment-indicator"></div>
                              </div>
                              {dayEvents.length > 1 && (
                                <div className="text-xs font-bold text-primary mt-0.5">
                                  {dayEvents.length}
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
                      <span>Has Events</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                      <span>Appointment</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Date Events */}
              {selectedCalendarDate && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">
                    Events for {formatDate(selectedCalendarDate)}
                  </h3>
                  
                  {getSelectedDateAppointments().length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No events scheduled for this date</p>
                  ) : (
                    <div className="space-y-3">
                      {getSelectedDateAppointments().map((item) => (
                        <div key={item._id || item.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="font-medium text-sm">
                                {item.timeSlot || item.time || 'All Day'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                item.status ? (
                                  item.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                ) : (
                                  item.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                )
                              }`}>
                                {item.status || item.priority || 'Event'}
                              </span>
                              {item.id && (
                                <button
                                  onClick={() => handleDeleteEvent(item.id)}
                                  className="p-1 text-red-500 hover:text-red-700"
                                  title="Delete Event"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center mb-1">
                            <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium">
                              {item.user?.fullName || item.createdBy || 'System Event'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {item.serviceType || item.title || 'Event'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                          {item.type && (
                            <p className="text-xs text-blue-600 mt-1 capitalize">
                              {item.type} Event
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Quick Actions */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-primary mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div 
                    className="bg-cream p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleNavigate('/gis-mapping')}
                  >
                    <div className="flex items-center mb-3">
                      <MapPinIcon className="w-6 h-6 text-primary mr-2" />
                      <h3 className="text-xl font-semibold text-primary">GIS & Mapping</h3>
                    </div>
                    <p className="text-gray-700">View and manage all location registrations</p>
                  </div>
                  
                  <div 
                    className="bg-cream p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleNavigate('/emergency-reports')}
                  >
                    <div className="flex items-center mb-3">
                      <BellAlertIcon className="w-6 h-6 text-primary mr-2" />
                      <h3 className="text-xl font-semibold text-primary">Emergency Reports</h3>
                    </div>
                    <p className="text-gray-700">View and manage emergency situations</p>
                  </div>
                  
                  <div 
                    className="bg-cream p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleNavigate('/appointments')}
                  >
                    <div className="flex items-center mb-3">
                      <CalendarIcon className="w-6 h-6 text-primary mr-2" />
                      <h3 className="text-xl font-semibold text-primary">Appointments</h3>
                    </div>
                    <p className="text-gray-700">Schedule and manage citizen appointments</p>
                  </div>
                </div>
              </div>

              {/* Today's Schedule */}
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-xl font-semibold text-primary mb-4 flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  Today's Schedule
                </h2>
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : todayAppointments.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No appointments scheduled for today</p>
                ) : (
                  <div className="space-y-4">
                    {todayAppointments.slice(0, 3).map((appointment) => (
                      <div key={appointment._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="font-medium">{formatTime(appointment.timeSlot)}</span>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                        <div className="flex items-center mb-2">
                          <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="font-medium">{appointment.user?.fullName || 'Unknown User'}</span>
                        </div>
                        <p className="text-sm text-gray-600">{appointment.serviceType}</p>
                        <p className="text-xs text-gray-500 mt-1">{appointment.description}</p>
                      </div>
                    ))}
                    {todayAppointments.length > 3 && (
                      <div className="text-center">
                        <button
                          onClick={() => handleNavigate('/appointments')}
                          className="text-primary hover:text-secondary text-sm font-medium"
                        >
                          View All ({todayAppointments.length}) Appointments
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Add New Event</h3>
              <button
                onClick={() => setShowAddEventModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={eventFormData.title}
                  onChange={(e) => setEventFormData({...eventFormData, title: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData({...eventFormData, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter event description"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={eventFormData.date}
                    onChange={(e) => setEventFormData({...eventFormData, date: e.target.value})}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    value={eventFormData.time}
                    onChange={(e) => setEventFormData({...eventFormData, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type
                  </label>
                  <select
                    id="type"
                    value={eventFormData.type}
                    onChange={(e) => setEventFormData({...eventFormData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="inspection">Inspection</option>
                    <option value="community">Community Event</option>
                    <option value="training">Training</option>
                    <option value="ceremony">Ceremony</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={eventFormData.priority}
                    onChange={(e) => setEventFormData({...eventFormData, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;