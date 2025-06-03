import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  UserCircleIcon, 
  BellIcon, 
  ArrowRightOnRectangleIcon,
  EnvelopeIcon 
} from '@heroicons/react/24/outline';

const CitizenNavbar = ({ userFullName, userRole }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const profileMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();
  
const navItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/citizen/dashboard' },
    { name: 'Profile', icon: UserCircleIcon, path: '/citizen/profile' },
    
];

  // Get user data from local storage
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    
    // Close menus when clicking outside
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch notifications (example)
  useEffect(() => {
    // This would be replaced with an actual API call
    const dummyNotifications = [
      { id: 1, title: 'New announcement', message: 'Community meeting scheduled for next week', read: false },
      { id: 2, title: 'Appointment confirmed', message: 'Your appointment has been confirmed for tomorrow', read: true }
    ];
    setNotifications(dummyNotifications);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    setActiveTab(path.includes('dashboard') ? 'Dashboard' : 'Profile');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const getFirstLetter = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const displayName = userFullName || userData?.fullName || 'User';
  
  return (
    <div className="fixed top-0 left-64 right-0 bg-white shadow-md z-10">
      <div className="flex justify-between items-center px-6 py-3">
        <div className="flex gap-6">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigate(item.path)}
              className={`flex items-center px-3 py-2 rounded-md transition-all duration-200 ${
                activeTab === item.name
                  ? 'bg-primary text-white font-medium'
                  : 'text-gray-600 hover:bg-cream hover:text-primary'
              }`}
            >
              <item.icon className="w-5 h-5 mr-2" />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button 
              className="relative p-2 rounded-full hover:bg-cream"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <BellIcon className="w-6 h-6 text-gray-600" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>
            
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium">Notifications</p>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-3 border-b ${!notification.read ? 'bg-blue-50' : ''}`}
                      >
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-gray-500">{notification.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">No notifications</div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Messages */}
          <button className="p-2 rounded-full hover:bg-cream">
            <EnvelopeIcon className="w-6 h-6 text-gray-600" />
          </button>
          
          {/* User profile dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button 
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 hover:bg-cream p-2 rounded-md"
            >
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white font-medium">
                {getFirstLetter(displayName)}
              </div>
              <span className="text-gray-800 font-medium hidden sm:inline-block">{displayName}</span>
            </button>
            
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-gray-500">Citizen</p>
                </div>
                
                <button 
                  onClick={() => {
                    handleNavigate('/citizen/profile');
                    setProfileMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-cream"
                >
                  <UserCircleIcon className="w-4 h-4 mr-2" />
                  My Profile
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-cream"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenNavbar;