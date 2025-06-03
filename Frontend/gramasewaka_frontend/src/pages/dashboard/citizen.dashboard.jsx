import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  DocumentTextIcon, 
  MapPinIcon, 
  BellAlertIcon,
  MegaphoneIcon,
  ChatBubbleLeftEllipsisIcon,
  ClipboardDocumentListIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import CitizenSidebar from '../../components/sidebar/citizen.sidebar';
import CitizenNavbar from '../../components/navbar/citizen.navbar';
import Footer from '../../components/footer/citizen.footer';

const CitizenDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    
    // Fetch announcements
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/announcements?limit=3');
      
      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }
      
      const data = await response.json();
      setAnnouncements(data.announcements || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAddress = (address) => {
    if (!address) return 'Not provided';
    return Object.values(address).filter(Boolean).join(', ');
  };

  return (
    <div className="flex min-h-screen bg-light">
      <CitizenSidebar />
      <div className="ml-64 w-full">
        <CitizenNavbar userFullName={userData?.fullName} userRole="citizen" />
        <main className="p-6 mt-16 mb-16">
          {/* Welcome Section */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h1 className="text-2xl font-bold text-primary mb-2">Welcome, {userData?.fullName || 'Citizen'}</h1>
            <p className="text-gray-600">
              Access all Grama Sevaka services from your dashboard.
            </p>
          </div>
          
          {/* Quick Services Section */}
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Service Request Card - NEW PROMINENT CARD */}
            <div 
              className="bg-primary text-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleNavigate('/citizen/service-request')}
            >
              <div className="flex items-center mb-2">
                <ClipboardDocumentListIcon className="w-6 h-6 text-white mr-2" />
                <h3 className="text-xl font-semibold text-white">Request Service</h3>
              </div>
              <p className="text-white/90 mb-3">Apply for certificates, verifications and other services</p>
              <div className="flex items-center text-white/80 text-sm">
                <span>Get Started</span>
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </div>
            </div>
            
            <div 
              className="bg-cream p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleNavigate('/citizen/service-requests')}
            >
              <div className="flex items-center mb-2">
                <DocumentTextIcon className="w-6 h-6 text-primary mr-2" />
                <h3 className="text-xl font-semibold text-primary">View My Requests</h3>
              </div>
              <p className="text-gray-700">Track status of your service applications</p>
            </div>
            
            <div 
              className="bg-cream p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleNavigate('/citizen/appointment')}
            >
              <div className="flex items-center mb-2">
                <CalendarIcon className="w-6 h-6 text-primary mr-2" />
                <h3 className="text-xl font-semibold text-primary">Appointments</h3>
              </div>
              <p className="text-gray-700">Schedule a meeting with Grama Sevaka</p>
            </div>
            
            <div 
              className="bg-cream p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleNavigate('/citizen/gis-mapping')}
            >
              <div className="flex items-center mb-2">
                <MapPinIcon className="w-6 h-6 text-primary mr-2" />
                <h3 className="text-xl font-semibold text-primary">GIS Mapping</h3>
              </div>
              <p className="text-gray-700">Register your residence and view local information</p>
            </div>
          </div>
          
          {/* Additional Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div 
              className="bg-cream p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleNavigate('/citizen/emergency')}
            >
              <div className="flex items-center mb-2">
                <BellAlertIcon className="w-6 h-6 text-primary mr-2" />
                <h3 className="text-lg font-semibold text-primary">Emergency Reports</h3>
              </div>
              <p className="text-gray-700">Report emergencies in your area</p>
            </div>
            
            <div 
              className="bg-cream p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleNavigate('/citizen/announcements')}
            >
              <div className="flex items-center mb-2">
                <MegaphoneIcon className="w-6 h-6 text-primary mr-2" />
                <h3 className="text-lg font-semibold text-primary">Announcements</h3>
              </div>
              <p className="text-gray-700">View important announcements</p>
            </div>
            
            <div 
              className="bg-cream p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleNavigate('/citizen/forum')}
            >
              <div className="flex items-center mb-2">
                <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-primary mr-2" />
                <h3 className="text-lg font-semibold text-primary">Community Forum</h3>
              </div>
              <p className="text-gray-700">Engage with your community</p>
            </div>
          </div>
          
          {/* Recent Announcements */}
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Announcements</h2>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                <p className="mt-2 text-gray-500">Loading announcements...</p>
              </div>
            ) : announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement._id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <h3 className="font-semibold text-lg text-gray-900">{announcement.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">Posted on {formatDate(announcement.createdAt)}</p>
                    <p className="text-gray-700 line-clamp-2">{announcement.content}</p>
                    <button 
                      onClick={() => handleNavigate(`/citizen/announcements/${announcement._id}`)}
                      className="mt-2 text-primary hover:text-secondary text-sm font-medium"
                    >
                      Read More
                    </button>
                  </div>
                ))}
                <div className="pt-2">
                  <button 
                    onClick={() => handleNavigate('/citizen/announcements')}
                    className="text-primary hover:text-secondary text-sm font-medium flex items-center"
                  >
                    View All Announcements
                    <ArrowRightIcon className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No announcements available</p>
            )}
          </div>
          
          {/* Personal Information Summary */}
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Information</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Profile</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Full Name:</span>
                    <p className="text-gray-900">{userData?.fullName || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">NIC:</span>
                    <p className="text-gray-900">{userData?.nic || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <p className="text-gray-900">{userData?.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Phone:</span>
                    <p className="text-gray-900">{userData?.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleNavigate('/citizen/profile')}
                  className="mt-4 text-primary hover:text-secondary text-sm font-medium"
                >
                  Edit Profile
                </button>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Address</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Residential Address:</span>
                    <p className="text-gray-900">{formatAddress(userData?.address)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">GN Division:</span>
                    <p className="text-gray-900">{userData?.gnDivision || 'Not provided'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleNavigate('/citizen/gis-mapping')}
                  className="mt-4 text-primary hover:text-secondary text-sm font-medium"
                >
                  Register My Residence
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default CitizenDashboard;