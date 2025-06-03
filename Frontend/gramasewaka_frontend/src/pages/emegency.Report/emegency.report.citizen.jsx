import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CitizenSidebar from "../../components/sidebar/citizen.sidebar";
import CitizenNavbar from "../../components/navbar/citizen.navbar";
import CitizenFooter from "../../components/footer/citizen.footer";
import EmergencyForm from "../../components/emegency.report/emergency.button.form";
// Import CSS first
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
// Then import JS
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import 'leaflet-routing-machine';

import {
  BellAlertIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentTextIcon,
  PaperClipIcon,
  XMarkIcon,
  FolderPlusIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

// Component to recenter the map to a given position
function SetViewOnClick({ coords }) {
  const map = useMap();

  useEffect(() => {
    if (coords && Array.isArray(coords) && coords.length === 2) {
      map.setView(coords, 13);
    }
  }, [map, coords]);

  return null;
}

// Component to show routing from user location to emergency location
function RoutingMachine({ userCoords, emergencyCoords, setRoutingInfo }) {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!userCoords || !emergencyCoords) return;

    if (!L.Routing || !L.Routing.control) {
      console.error("Leaflet Routing Machine not loaded properly");
      return;
    }

    // Clean up previous routing control
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    try {
      const waypoints = [
        L.latLng(userCoords[0], userCoords[1]),
        L.latLng(emergencyCoords[0], emergencyCoords[1])
      ];

      const routingControl = L.Routing.control({
        waypoints,
        routeWhileDragging: false,
        showAlternatives: true,
        lineOptions: {
          styles: [{ color: "#6366f1", opacity: 0.8, weight: 6 }],
        },
        createMarker: () => null
      }).addTo(map);

      routingControlRef.current = routingControl;

      routingControl.on("routesfound", (e) => {
        const routes = e.routes;
        const summary = routes[0].summary;
        setRoutingInfo({
          distance: (summary.totalDistance / 1000).toFixed(2),
          time: Math.round(summary.totalTime / 60)
        });
      });
    } catch (err) {
      console.error("Error creating routing control:", err);
    }

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, userCoords, emergencyCoords, setRoutingInfo]);

  return null;
}

const EmergencyReportCitizen = () => {
  const [userData, setUserData] = useState(null);
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [mapPosition, setMapPosition] = useState([7.8731, 80.7718]); // Sri Lanka center
  const [userCoordinates, setUserCoordinates] = useState(null);
  const [routingActive, setRoutingActive] = useState(false);
  const [routingInfo, setRoutingInfo] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Custom icons for different emergency types
  const emergencyIcons = {
    "Natural Disaster": new L.Icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    }),
    Fire: new L.Icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    }),
    "Medical Emergency": new L.Icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    }),
    Crime: new L.Icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    }),
    default: new L.Icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    }),
  };
  
  // Setup Leaflet icons
  useEffect(() => {
    // Fix for the marker icon issue in Leaflet with webpack
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  // Get user data from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    } else {
      // Redirect to login if no user data
      navigate("/login");
    }

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoordinates([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, [navigate]);

  // Fetch emergency reports
  useEffect(() => {
    const fetchEmergencies = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/emergencies/recent', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch emergency reports');
        
        const data = await response.json();
        setEmergencies(data);
        setError(null);
      } catch (err) {
        setError('Error loading emergency reports: ' + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchEmergencies();
    }
  }, [token, refreshTrigger]);
  
  // Get appropriate icon for emergency type
  const getMarkerIcon = (type) => {
    return emergencyIcons[type] || emergencyIcons.default;
  };

  // Toggle routing to emergency location
  const toggleRouting = () => {
    setRoutingActive(!routingActive);
  };

  // Open navigation in external app
  const openExternalNavigation = (emergency) => {
    if (!emergency || !emergency.location?.coordinates?.coordinates) return;
    
    const [lng, lat] = emergency.location.coordinates.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
  };

  // Handle emergency report submission
  const handleEmergencySubmit = (result) => {
    // Refresh the emergency list
    setRefreshTrigger(prev => prev + 1);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "reported":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get severity badge class
  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex min-h-screen bg-light">
      <CitizenSidebar />
      <div className="ml-64 w-full">
        <CitizenNavbar userFullName={userData?.fullName} userRole="citizen" />
        <main className="p-6 mt-16 mb-16">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-primary">
              Emergency Reports
            </h1>
            <button
              onClick={() => setShowReportForm(true)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <BellAlertIcon className="w-5 h-5 mr-2" />
              Report Emergency
            </button>
          </div>
          
          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* List of emergency reports */}
            <div className="lg:col-span-3">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2 text-primary" />
                  My Emergency Reports
                </h2>
                
                {loading ? (
                  <div className="py-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                    <p className="mt-2 text-gray-500">Loading reports...</p>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 text-red-700 p-4 rounded-md">
                    {error}
                  </div>
                ) : emergencies.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">No emergency reports found.</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Click "Report Emergency" to create a new report.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {emergencies.map((emergency) => (
                      <div key={emergency._id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{emergency.title}</h3>
                          <div className="flex space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(emergency.status)}`}>
                              {emergency.status.charAt(0).toUpperCase() + emergency.status.slice(1)}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getSeverityBadgeClass(emergency.severity)}`}>
                              {emergency.severity.charAt(0).toUpperCase() + emergency.severity.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-500 mt-1">
                          {emergency.emergencyType} • {formatTime(emergency.createdAt)}
                        </p>
                        
                        <div className="mt-3 flex items-center text-xs text-gray-500">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          <span className="truncate">{emergency.location.address}</span>
                        </div>
                        
                        <div className="mt-3 flex space-x-3">
                          <button
                            onClick={() => {
                              setSelectedEmergency(emergency);
                              setMapPosition(emergency.location.coordinates.coordinates.reverse());
                            }}
                            className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                          >
                            View on map
                          </button>
                          <button
                            onClick={() => openExternalNavigation(emergency)}
                            className="px-3 py-1 text-xs bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 flex items-center"
                          >
                            Navigate
                            <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Map view */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-md h-full">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-2 text-primary" />
                  Location Map
                </h2>
                
                <div className="h-[400px]">
                  <MapContainer 
                    center={mapPosition} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* User marker */}
                    {userCoordinates && (
                      <Marker position={userCoordinates}>
                        <Popup>Your Location</Popup>
                      </Marker>
                    )}
                    
                    {/* Selected emergency marker */}
                    {selectedEmergency && selectedEmergency.location?.coordinates?.coordinates && (
                      <Marker 
                        position={selectedEmergency.location.coordinates.coordinates.slice().reverse()} 
                        icon={getMarkerIcon(selectedEmergency.emergencyType)}
                      >
                        <Popup>
                          <div>
                            <h3 className="font-medium">{selectedEmergency.title}</h3>
                            <p className="text-xs">{selectedEmergency.location.address}</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                    
                    {/* Recenter map when selected emergency changes */}
                    {selectedEmergency && selectedEmergency.location?.coordinates?.coordinates && (
                      <SetViewOnClick coords={selectedEmergency.location.coordinates.coordinates.slice().reverse()} />
                    )}
                    
                    {/* Show routing if active */}
                    {routingActive && userCoordinates && selectedEmergency && selectedEmergency.location?.coordinates?.coordinates && (
                      <RoutingMachine 
                        userCoords={userCoordinates} 
                        emergencyCoords={selectedEmergency.location.coordinates.coordinates.slice().reverse()}
                        setRoutingInfo={setRoutingInfo}
                      />
                    )}
                  </MapContainer>
                </div>
                
                {/* Routing controls */}
                {selectedEmergency && (
                  <div className="mt-4 flex justify-between items-center">
                    <div>
                      <button
                        onClick={toggleRouting}
                        className={`px-3 py-1 text-sm rounded-md ${
                          routingActive 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {routingActive ? 'Hide Route' : 'Show Route'}
                      </button>
                    </div>
                    
                    {routingInfo && routingActive && (
                      <div className="text-sm text-gray-600">
                        <span className="mr-3">Distance: {routingInfo.distance} km</span>
                        <span>Est. Time: {routingInfo.time} min</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        <CitizenFooter />
      </div>
      
      {/* Emergency report form modal */}
      {showReportForm && (
        <EmergencyForm 
          onClose={() => setShowReportForm(false)} 
          onSubmit={handleEmergencySubmit}
          userData={userData}
        />
      )}
    </div>
  );
};

export default EmergencyReportCitizen;