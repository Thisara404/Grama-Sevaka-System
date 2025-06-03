// import { useState, useEffect } from 'react';
// import { CalendarIcon, ClockIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
// import Sidebar from '../../components/sidebar/gramasewaka.sidebar';
// import Navbar from '../../components/navbar/gramasewaka.navbar';
// import Footer from '../../components/footer/gramasewaka.footer';

// const AppointmentManagement = () => {
//   const [userData, setUserData] = useState(null);
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [selectedAppointment, setSelectedAppointment] = useState(null);
//   const [showDetailModal, setShowDetailModal] = useState(false);
//   const [notes, setNotes] = useState('');
//   const token = localStorage.getItem('token');
//   const [activeTab, setActiveTab] = useState('pending');
//   const [upcomingAppointments, setUpcomingAppointments] = useState([]);

//   // Get user data from localStorage
//   useEffect(() => {
//     const storedUserData = localStorage.getItem('userData');
//     if (storedUserData) {
//       setUserData(JSON.parse(storedUserData));
//     }
//   }, []);

//   useEffect(() => {
//     fetchAppointments();
//     // Fetch upcoming events (confirmed appointments)
//     fetchUpcomingAppointments();
//   }, [selectedDate, statusFilter]);

//   const fetchAppointments = async () => {
//     try {
//       setLoading(true);
//       const queryParams = new URLSearchParams();
      
//       if (selectedDate) {
//         queryParams.append('date', selectedDate);
//       }
      
//       if (statusFilter !== 'all') {
//         queryParams.append('status', statusFilter);
//       }
      
//       const response = await fetch(`http://localhost:5000/api/appointments?${queryParams.toString()}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
      
//       if (!response.ok) throw new Error('Failed to fetch appointments');
      
//       const data = await response.json();
//       setAppointments(data.appointments);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchUpcomingAppointments = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/api/appointments?status=confirmed', {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
      
//       if (!response.ok) throw new Error('Failed to fetch upcoming appointments');
      
//       const data = await response.json();
//       setUpcomingAppointments(data.appointments);
//     } catch (err) {
//       console.error('Error fetching upcoming appointments:', err.message);
//     }
//   };

//   const handleStatusChange = async (id, newStatus, notesText = '') => {
//     try {
//       const statusData = { 
//         status: newStatus,
//         notes: notesText || notes 
//       };
      
//       const response = await fetch(`http://localhost:5000/api/appointments/${id}/status`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(statusData)
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to update status');
//       }
      
//       // Update the appointment in the list
//       setAppointments(appointments.map(apt => 
//         apt._id === id ? { ...apt, status: newStatus, notes: notesText || notes } : apt
//       ));

//       // If confirmed, also add to upcoming appointments
//       if (newStatus === 'confirmed') {
//         const updatedAppointment = appointments.find(apt => apt._id === id);
//         if (updatedAppointment) {
//           setUpcomingAppointments([...upcomingAppointments, {...updatedAppointment, status: 'confirmed'}]);
//         }
//       }
      
//       // Close modal if it was open
//       setShowDetailModal(false);
//       setSelectedAppointment(null);
//       setNotes('');
      
//       // Show confirmation message
//       alert(`Appointment ${newStatus === 'confirmed' ? 'confirmed' : 'updated to ' + newStatus}`);
      
//       // Refresh lists
//       fetchAppointments();
//       fetchUpcomingAppointments();
//     } catch (err) {
//       setError(err.message);
//       alert(`Error: ${err.message}`);
//     }
//   };

//   const handleViewDetails = (appointment) => {
//     setSelectedAppointment(appointment);
//     setShowDetailModal(true);
//   };

//   const filteredAppointments = activeTab === 'pending' 
//     ? appointments.filter(apt => apt.status === 'pending')
//     : activeTab === 'upcoming'
//     ? upcomingAppointments
//     : appointments;

//   // Format date to display in a readable format
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       weekday: 'short',
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   return (
//     <div className="flex min-h-screen bg-light">
//       <Sidebar />
//       <div className="ml-64 w-full">
//         <Navbar userFullName={userData?.fullName} userRole={userData?.role} />
//         <main className="p-6 mt-16 mb-16">
//           <h1 className="text-2xl font-bold text-primary mb-6">Appointment Management</h1>
          
//           {/* Navigation tabs */}
//           <div className="flex border-b border-gray-200 mb-6">
//             <button
//               onClick={() => setActiveTab('pending')}
//               className={`px-4 py-2 ${activeTab === 'pending' ? 
//                 'border-b-2 border-primary text-primary font-medium' : 
//                 'text-gray-500 hover:text-gray-700'}`}
//             >
//               Pending Requests
//             </button>
//             <button
//               onClick={() => setActiveTab('upcoming')}
//               className={`px-4 py-2 ${activeTab === 'upcoming' ? 
//                 'border-b-2 border-primary text-primary font-medium' : 
//                 'text-gray-500 hover:text-gray-700'}`}
//             >
//               Upcoming Events
//             </button>
//             <button
//               onClick={() => setActiveTab('all')}
//               className={`px-4 py-2 ${activeTab === 'all' ? 
//                 'border-b-2 border-primary text-primary font-medium' : 
//                 'text-gray-500 hover:text-gray-700'}`}
//             >
//               All Appointments
//             </button>
//           </div>
          
//           {activeTab !== 'upcoming' && (
//             <div className="flex flex-wrap gap-4 mb-6">
//               <div>
//                 <label htmlFor="date-filter" className="block text-sm text-gray-700 mb-1">Filter by Date</label>
//                 <input
//                   type="date"
//                   id="date-filter"
//                   value={selectedDate}
//                   onChange={(e) => setSelectedDate(e.target.value)}
//                   className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
//                 />
//               </div>
              
//               <div>
//                 <label htmlFor="status-filter" className="block text-sm text-gray-700 mb-1">Filter by Status</label>
//                 <select
//                   id="status-filter"
//                   value={statusFilter}
//                   onChange={(e) => setStatusFilter(e.target.value)}
//                   className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
//                 >
//                   <option value="all">All Statuses</option>
//                   <option value="pending">Pending</option>
//                   <option value="confirmed">Confirmed</option>
//                   <option value="cancelled">Cancelled</option>
//                   <option value="completed">Completed</option>
//                   <option value="no-show">No Show</option>
//                 </select>
//               </div>
              
//               <div className="flex items-end">
//                 <button 
//                   onClick={() => fetchAppointments()}
//                   className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
//                 >
//                   Refresh
//                 </button>
//               </div>
//             </div>
//           )}
          
//           {loading ? (
//             <div className="text-center py-4">Loading appointments...</div>
//           ) : error ? (
//             <div className="text-center text-red-500 py-4">{error}</div>
//           ) : filteredAppointments.length === 0 ? (
//             <div className="text-center text-gray-500 py-4 bg-white rounded-lg shadow-md p-8">
//               {activeTab === 'pending' ? (
//                 "No pending appointment requests at this time."
//               ) : activeTab === 'upcoming' ? (
//                 "No upcoming confirmed appointments."
//               ) : (
//                 "No appointments found for the selected criteria."
//               )}
//             </div>
//           ) : (
//             <div className="bg-white rounded-lg shadow-md overflow-hidden">
//               {activeTab === 'upcoming' ? (
//                 <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {upcomingAppointments.map((appointment) => (
//                     <div 
//                       key={appointment._id}
//                       className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
//                       onClick={() => handleViewDetails(appointment)}
//                     >
//                       <div className="flex justify-between items-start">
//                         <h3 className="font-medium text-primary">{appointment.serviceType}</h3>
//                         <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
//                           Confirmed
//                         </span>
//                       </div>
//                       <p className="text-sm text-gray-500 mt-1">{appointment.user?.fullName}</p>
//                       <div className="mt-2 flex items-center text-gray-500 text-sm">
//                         <CalendarIcon className="w-4 h-4 mr-1" />
//                         {formatDate(appointment.date)}
//                       </div>
//                       <div className="mt-1 flex items-center text-gray-500 text-sm">
//                         <ClockIcon className="w-4 h-4 mr-1" />
//                         {appointment.timeSlot}
//                       </div>
//                       <p className="text-sm mt-2 line-clamp-2 text-gray-600">
//                         {appointment.description}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Citizen</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Type</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {filteredAppointments.map((appointment) => (
//                         <tr key={appointment._id}>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="font-medium text-gray-900">{appointment.user?.fullName}</div>
//                             <div className="text-sm text-gray-500">{appointment.user?.email}</div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {appointment.serviceType}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {appointment.department}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="text-sm text-gray-900">
//                               {formatDate(appointment.date)}
//                             </div>
//                             <div className="text-sm text-gray-500">{appointment.timeSlot}</div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//                               appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
//                               appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
//                               appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
//                               appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
//                               appointment.status === 'no-show' ? 'bg-purple-100 text-purple-800' :
//                               'bg-gray-100 text-gray-800'
//                             }`}>
//                               {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                             <div className="flex space-x-3">
//                               <button
//                                 onClick={() => handleViewDetails(appointment)}
//                                 className="text-blue-600 hover:text-blue-900"
//                               >
//                                 Details
//                               </button>
                              
//                               {appointment.status === 'pending' && (
//                                 <>
//                                   <button
//                                     onClick={() => handleStatusChange(appointment._id, 'confirmed')}
//                                     className="text-green-600 hover:text-green-900"
//                                   >
//                                     Confirm
//                                   </button>
//                                   <button
//                                     onClick={() => handleStatusChange(appointment._id, 'cancelled')}
//                                     className="text-red-600 hover:text-red-900"
//                                   >
//                                     Cancel
//                                   </button>
//                                 </>
//                               )}
//                               {appointment.status === 'confirmed' && (
//                                 <>
//                                   <button
//                                     onClick={() => handleStatusChange(appointment._id, 'completed')}
//                                     className="text-blue-600 hover:text-blue-900"
//                                   >
//                                     Complete
//                                   </button>
//                                   <button
//                                     onClick={() => handleStatusChange(appointment._id, 'no-show')}
//                                     className="text-purple-600 hover:text-purple-900"
//                                   >
//                                     No Show
//                                   </button>
//                                 </>
//                               )}
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Appointment Details Modal */}
//           {showDetailModal && selectedAppointment && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
//               <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//                 <div className="p-6">
//                   <div className="flex justify-between items-start">
//                     <h2 className="text-xl font-semibold text-primary">Appointment Details</h2>
//                     <button 
//                       onClick={() => {
//                         setShowDetailModal(false);
//                         setSelectedAppointment(null);
//                         setNotes('');
//                       }}
//                       className="text-gray-400 hover:text-gray-600"
//                     >
//                       <XMarkIcon className="w-6 h-6" />
//                     </button>
//                   </div>
                  
//                   <div className="mt-4 space-y-4">
//                     <div className="flex justify-between">
//                       <div>
//                         <p className="text-sm text-gray-500">Citizen</p>
//                         <p className="font-medium">{selectedAppointment.user?.fullName}</p>
//                         <p className="text-sm">{selectedAppointment.user?.email}</p>
//                         {selectedAppointment.user?.phoneNumber && (
//                           <p className="text-sm">{selectedAppointment.user?.phoneNumber}</p>
//                         )}
//                       </div>
//                       <div className="text-right">
//                         <p className="text-sm text-gray-500">Status</p>
//                         <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
//                           selectedAppointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
//                           selectedAppointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
//                           selectedAppointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
//                           selectedAppointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
//                           selectedAppointment.status === 'no-show' ? 'bg-purple-100 text-purple-800' :
//                           'bg-gray-100 text-gray-800'
//                         }`}>
//                           {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
//                         </span>
//                       </div>
//                     </div>
                    
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <p className="text-sm text-gray-500">Service Type</p>
//                         <p className="font-medium">{selectedAppointment.serviceType}</p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-gray-500">Department</p>
//                         <p className="font-medium">{selectedAppointment.department}</p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-gray-500">Date</p>
//                         <p className="font-medium">{formatDate(selectedAppointment.date)}</p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-gray-500">Time</p>
//                         <p className="font-medium">{selectedAppointment.timeSlot}</p>
//                       </div>
//                     </div>
                    
//                     <div>
//                       <p className="text-sm text-gray-500">Description</p>
//                       <p className="text-gray-700 bg-gray-50 p-3 rounded-md mt-1">
//                         {selectedAppointment.description}
//                       </p>
//                     </div>

//                     {selectedAppointment.notes && (
//                       <div>
//                         <p className="text-sm text-gray-500">Notes</p>
//                         <p className="text-gray-700 bg-gray-50 p-3 rounded-md mt-1">
//                           {selectedAppointment.notes}
//                         </p>
//                       </div>
//                     )}

//                     {(selectedAppointment.status === 'pending' || selectedAppointment.status === 'confirmed') && (
//                       <div>
//                         <p className="text-sm text-gray-500">Add Notes</p>
//                         <textarea
//                           value={notes}
//                           onChange={(e) => setNotes(e.target.value)}
//                           rows={3}
//                           className="w-full border rounded-md p-2 mt-1"
//                           placeholder="Add any notes or comments about this appointment"
//                         ></textarea>
//                       </div>
//                     )}
//                   </div>
                  
//                   <div className="mt-6 flex justify-end space-x-3">
//                     {selectedAppointment.status === 'pending' && (
//                       <>
//                         <button
//                           onClick={() => handleStatusChange(selectedAppointment._id, 'cancelled', notes)}
//                           className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
//                         >
//                           Reject
//                         </button>
//                         <button
//                           onClick={() => handleStatusChange(selectedAppointment._id, 'confirmed', notes)}
//                           className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
//                         >
//                           Confirm Appointment
//                         </button>
//                       </>
//                     )}
//                     {selectedAppointment.status === 'confirmed' && (
//                       <>
//                         <button
//                           onClick={() => handleStatusChange(selectedAppointment._id, 'completed', notes)}
//                           className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                         >
//                           Mark Completed
//                         </button>
//                         <button
//                           onClick={() => handleStatusChange(selectedAppointment._id, 'no-show', notes)}
//                           className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
//                         >
//                           Mark as No-Show
//                         </button>
//                       </>
//                     )}
//                     <button
//                       onClick={() => {
//                         setShowDetailModal(false);
//                         setSelectedAppointment(null);
//                         setNotes('');
//                       }}
//                       className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
//                     >
//                       Close
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </main>
//         <Footer />
//       </div>
//     </div>
//   );
// };

// export default AppointmentManagement;