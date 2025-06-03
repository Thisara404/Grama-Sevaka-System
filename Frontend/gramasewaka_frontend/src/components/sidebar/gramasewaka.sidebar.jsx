import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  MapIcon,
  BellAlertIcon,
  CalendarIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  SpeakerWaveIcon,
  ScaleIcon,
  ClipboardDocumentListIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

const GramaSewakaSidebar = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("");

  useEffect(() => {
    const path = location.pathname;
    if (path === "/dashboard" || path === "/") {
      setActiveItem("dashboard");
    } else if (path.includes("/gis-mapping")) {
      setActiveItem("gis-mapping");
    } else if (path.includes("/emergency-reports")) {
      setActiveItem("emergency-reports");
    } else if (path.includes("/appointments")) {
      setActiveItem("appointments");
    } else if (path.includes("/announcements")) {
      setActiveItem("announcements");
    } else if (path.includes("/services")) {
      setActiveItem("service-management");
    } else if (path.includes("/forum")) {
      setActiveItem("community-forum");
    } else if (path.includes("/legal-cases")) {
      setActiveItem("legal-cases");
    } else if (path.includes("/profile")) {
      setActiveItem("profile");
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    window.location.href = "/login";
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: HomeIcon },
    { name: "GIS & Mapping", path: "/gis-mapping", icon: MapIcon },
    {
      name: "Emergency Reports",
      path: "/emergency-reports",
      icon: BellAlertIcon,
    },
    { name: "Appointments", path: "/appointments", icon: CalendarIcon },
    { name: "Announcements", path: "/announcements", icon: SpeakerWaveIcon },
    {
      name: "Service Management",
      path: "/services",
      icon: ClipboardDocumentListIcon,
    },
    { name: "Community Forum", path: "/forum", icon: ChatBubbleLeftRightIcon },
    { name: "Legal Cases", path: "/legal-cases", icon: ScaleIcon },
    { name: "Profile", path: "/profile", icon: UserCircleIcon },
  ];

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-20">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 mr-3" />
          <div>
            <h1 className="text-xl font-bold text-primary">Grama Sevaka</h1>
            <p className="text-sm text-gray-700 mt-1">Officer Portal</p>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                activeItem === item.name.toLowerCase().replace(/\s+/g, "-")
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-cream hover:text-primary"
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

export default GramaSewakaSidebar;
