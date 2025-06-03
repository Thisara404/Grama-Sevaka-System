import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  CalendarIcon, 
  DocumentTextIcon, 
  MapPinIcon, 
  BellAlertIcon,
  MegaphoneIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  ScaleIcon  // Add this import
} from '@heroicons/react/24/outline';

const CitizenSidebar = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('');

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/dashboard')) {
      setActiveItem('dashboard');
    } else if (path.includes('/appointment')) {
      setActiveItem('appointments');
    } else if (path.includes('/services')) {
      setActiveItem('services');
    } else if (path.includes('/service-request')) {
      setActiveItem('service-requests');
    } else if (path.includes('/gis-mapping')) {
      setActiveItem('gis-mapping');
    } else if (path.includes('/emergency')) {
      setActiveItem('emergency');
    } else if (path.includes('/announcements')) {
      setActiveItem('announcements');
    } else if (path.includes('/forum')) {
      setActiveItem('forum');
    } else if (path.includes('/legal-cases')) {
      setActiveItem('legal cases');
    } else if (path.includes('/profile')) {
      setActiveItem('profile');
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    window.location.href = '/login';
  };

  const menuItems = [
    { name: 'Dashboard', path: '/citizen/dashboard', icon: HomeIcon },
    { name: 'Appointments', path: '/citizen/appointment', icon: CalendarIcon },
    { name: 'Services', path: '/citizen/services', icon: DocumentTextIcon },
    { name: 'Service Requests', path: '/citizen/service-requests', icon: ClipboardDocumentListIcon },
    { name: 'GIS Mapping', path: '/citizen/gis-mapping', icon: MapPinIcon },
    { name: 'Emergency', path: '/citizen/emergency', icon: BellAlertIcon },
    { name: 'Announcements', path: '/citizen/announcements', icon: MegaphoneIcon },
    { name: 'Community Forum', path: '/citizen/forum', icon: ChatBubbleLeftRightIcon },
    { name: 'Legal Cases', path: '/citizen/legal-cases', icon: ScaleIcon },
    { name: 'Profile', path: '/citizen/profile', icon: UserIcon },
  ];

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-20">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 mr-3" />
          <div>
            <h1 className="text-xl font-bold text-primary">Grama Sevaka</h1>
            <p className="text-sm text-gray-700 mt-1">Citizen Portal</p>
          </div>
        </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                activeItem === item.name.toLowerCase()
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-cream hover:text-primary'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default CitizenSidebar;