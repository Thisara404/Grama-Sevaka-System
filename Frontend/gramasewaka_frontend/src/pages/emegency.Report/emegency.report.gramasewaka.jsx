import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar/gramasewaka.sidebar";
import Navbar from "../../components/navbar/gramasewaka.navbar";
import Footer from "../../components/footer/gramasewaka.footer";

// Import CSS first
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "./emergency-report.css";

// Custom CSS for better map display
const mapStyles = `
  .leaflet-popup-content-wrapper {
    border-radius: 8px;
    padding: 0;
  }
  .leaflet-popup-content {
    margin: 12px;
    line-height: 1.4;
  }
  .leaflet-routing-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  .leaflet-control-zoom {
    border-radius: 8px;
    border: none;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  .leaflet-control-zoom a {
    border-radius: 8px;
    border: none;
  }
`;

// Inject custom styles
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = mapStyles;
document.head.appendChild(styleSheet);

// Then import JS
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import 'leaflet-routing-machine';

import {
  MapPinIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
  ArrowTopRightOnSquareIcon,
  FolderPlusIcon,
  PhoneIcon,
  UserIcon,
  EnvelopeIcon,
  ChatBubbleLeftIcon,
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

    // Make sure L.Routing is available
    if (!L.Routing || !L.Routing.control) {
      console.error("Leaflet Routing Machine not loaded properly");
      return;
    }

    // Clean up previous routing control if it exists
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    try {
      // Create waypoints
      const waypoints = [
        L.latLng(userCoords[0], userCoords[1]),
        L.latLng(emergencyCoords[0], emergencyCoords[1]),
      ];

      // Create routing control
      const routingControl = L.Routing.control({
        waypoints,
        routeWhileDragging: false,
        showAlternatives: true,
        fitSelectedRoutes: true,
        lineOptions: {
          styles: [{ color: "#6366f1", opacity: 0.8, weight: 6 }],
        },
        createMarker: () => null, // We'll use our own markers
      }).addTo(map);

      routingControlRef.current = routingControl;

      // Get route info when route is calculated
      routingControl.on("routesfound", (e) => {
        const routes = e.routes;
        const summary = routes[0].summary;

        setRoutingInfo({
          distance: (summary.totalDistance / 1000).toFixed(2), // km
          time: Math.round(summary.totalTime / 60), // minutes
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

const EmergencyReportGramasewaka = () => {
  const [userData, setUserData] = useState(null);
  const [emergencies, setEmergencies] = useState([]);
  const [emergencyTypes, setEmergencyTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [mapPosition, setMapPosition] = useState([7.8731, 80.7718]);
  const [userCoordinates, setUserCoordinates] = useState(null);
  const [routingActive, setRoutingActive] = useState(false);
  const [routingInfo, setRoutingInfo] = useState(null);
  const [authoritiesContacted, setAuthoritiesContacted] = useState({});
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Status update form state
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: "",
    severity: "",
    notes: "",
    authorities: [],
  });

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

  // List of emergency authorities
  const emergencyAuthorities = [
    { id: "police", name: "Police Department", phone: "119" },
    { id: "ambulance", name: "Ambulance Service", phone: "110" },
    { id: "fire", name: "Fire Department", phone: "111" },
    { id: "disaster", name: "Disaster Management Center", phone: "117" },
  ];

  // Setup Leaflet icons
  useEffect(() => {
    // Fix for the marker icon issue in Leaflet
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    // Dynamically import leaflet routing machine
    const loadLeafletRouting = async () => {
      try {
        await import("leaflet-routing-machine");
      } catch (error) {
        console.error("Failed to load leaflet-routing-machine:", error);
      }
    };
    loadLeafletRouting();
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

  // Get appropriate icon for emergency type
  const getMarkerIcon = (type) => {
    return emergencyIcons[type] || emergencyIcons.default;
  };

  // Toggle routing to emergency location
  const toggleRouting = () => {
    setRoutingActive(!routingActive);
  };

  // Open navigation in external app
  const openExternalNavigation = () => {
    if (!selectedEmergency || !selectedEmergency.location?.coordinates?.coordinates) return;

    const [lng, lat] = selectedEmergency.location.coordinates.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
  };

  // Handle citizen contact actions
  const handleCallCitizen = (phoneNumber) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    }
  };

  const handleMessageCitizen = (phoneNumber) => {
    if (phoneNumber) {
      // For SMS on mobile devices
      window.open(`sms:${phoneNumber}`, '_self');
    }
  };

  const handleEmailCitizen = (email) => {
    if (email) {
      window.open(`mailto:${email}`, '_self');
    }
  };

  // Handle status update input changes
  const handleStatusUpdateChange = (e) => {
    const { name, value } = e.target;
    setStatusUpdateData({
      ...statusUpdateData,
      [name]: value,
    });
  };

  // Toggle authority in status update
  const toggleAuthority = (authorityId) => {
    setStatusUpdateData((prev) => {
      const authorities = prev.authorities || [];
      if (authorities.includes(authorityId)) {
        return {
          ...prev,
          authorities: authorities.filter((id) => id !== authorityId),
        };
      } else {
        return {
          ...prev,
          authorities: [...authorities, authorityId],
        };
      }
    });
  };

  // Handle status update for an emergency
  const handleStatusUpdate = async (e) => {
    e.preventDefault();

    if (!selectedEmergency) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/emergencies/${selectedEmergency._id}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...statusUpdateData,
            notifiedAuthorities: statusUpdateData.authorities,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update status");
      }

      // Update the emergency in the list
      setEmergencies(
        emergencies.map((emergency) =>
          emergency._id === selectedEmergency._id
            ? {
                ...emergency,
                status: statusUpdateData.status,
                severity: statusUpdateData.severity || emergency.severity,
                notifiedAuthorities: statusUpdateData.authorities || [],
              }
            : emergency
        )
      );

      // Record which authorities were contacted
      if (
        statusUpdateData.authorities &&
        statusUpdateData.authorities.length > 0
      ) {
        setAuthoritiesContacted((prev) => ({
          ...prev,
          [selectedEmergency._id]: [
            ...(prev[selectedEmergency._id] || []),
            ...statusUpdateData.authorities,
          ],
        }));
      }

      // Reset form
      setStatusUpdateData({
        status: "",
        severity: "",
        notes: "",
        authorities: [],
      });

      // Refresh the selected emergency details
      await viewEmergencyDetails(selectedEmergency._id);

      alert("Emergency status updated successfully!");
    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    }
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
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Update the component's body to fetch emergency reports
  useEffect(() => {
    const fetchEmergencies = async () => {
      try {
        setLoading(true);
        const endpoint = "http://localhost:5000/api/emergencies/recent";

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch emergencies");
        }

        const data = await response.json();
        // Handle different response structures
        const emergencyList = data.emergencies || data;
        setEmergencies(emergencyList);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Fetch emergency types
    const fetchEmergencyTypes = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/emergencies/types"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch emergency types");
        }
        const data = await response.json();
        setEmergencyTypes(data);
      } catch (err) {
        console.error("Error fetching emergency types:", err);
      }
    };

    if (token) {
      fetchEmergencies();
      fetchEmergencyTypes();
    }
  }, [token]);

  // Add a function to view emergency details
  const viewEmergencyDetails = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:5000/api/emergencies/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch emergency details");
      }

      const data = await response.json();
      setSelectedEmergency(data);

      // Set map position to the emergency location
      if (
        data.location &&
        data.location.coordinates &&
        data.location.coordinates.coordinates
      ) {
        const [lng, lat] = data.location.coordinates.coordinates;
        setMapPosition([lat, lng]);
      } else {
        // Fallback to default Sri Lanka coordinates if location is invalid
        setMapPosition([7.8731, 80.7718]);
      }
      
      // Reset routing when viewing new emergency
      setRoutingActive(false);
      setRoutingInfo(null);
      
    } catch (err) {
      setError(err.message);
      console.error("Error fetching emergency details:", err);
    } finally {
      setLoading(false);
    }
  };

  // Basic render structure for debugging
  return (
    <div className="flex min-h-screen bg-light">
      <Sidebar />
      <div className="ml-64 w-full">
        <Navbar userFullName={userData?.fullName} userRole={userData?.role} />
        <main className="p-6 mt-16 main-content min-h-[calc(100vh-8rem)]">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-primary">
              Emergency Reports
            </h1>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold text-primary mb-4">
              Recent Emergency Reports
            </h2>

            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading emergencies...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-md">
                {error}
              </div>
            ) : emergencies.length === 0 ? (
              <div className="text-center py-10">
                <ExclamationTriangleIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No emergencies found</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 emergency-scroll">
                {emergencies.map((emergency) => (
                  <div
                    key={emergency._id}
                    className={`emergency-list-item p-4 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedEmergency?._id === emergency._id
                        ? "selected bg-gray-50 border-primary"
                        : ""
                    }`}
                    onClick={() => viewEmergencyDetails(emergency._id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 truncate">
                          {emergency.title}
                        </h3>
                        <span
                          className={`status-badge inline-block px-2 py-0.5 text-xs rounded-full ${getStatusBadgeClass(
                            emergency.status
                          )}`}
                        >
                          {emergency.status.charAt(0).toUpperCase() +
                            emergency.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`severity-badge inline-block px-2 py-0.5 text-xs rounded-full ${getSeverityBadgeClass(
                            emergency.severity
                          )}`}
                        >
                          {emergency.severity.charAt(0).toUpperCase() +
                            emergency.severity.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                      {emergency.emergencyType}
                    </div>
                    {emergency.reporter?.fullName && (
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <UserIcon className="w-4 h-4 mr-1" />
                        <span className="truncate">
                          Reported by: {emergency.reporter.fullName}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      <span className="truncate">
                        {emergency.location?.address}
                      </span>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {formatDate(emergency.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map display */}
          {selectedEmergency && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-xl font-semibold text-primary">
                  Emergency Details: {selectedEmergency.title}
                </h2>
                <button
                  onClick={() => setSelectedEmergency(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close Details
                </button>
              </div>
              
              <div className="mb-6">
                <div className="h-[500px] bg-gray-100 rounded-lg overflow-hidden relative z-0 map-container">
                  <MapContainer
                    center={mapPosition}
                    zoom={15}
                    style={{ height: "100%", width: "100%", zIndex: 1 }}
                    scrollWheelZoom={true}
                    doubleClickZoom={true}
                    touchZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* User location marker */}
                    {userCoordinates && (
                      <Marker position={userCoordinates}>
                        <Popup>
                          <div className="text-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
                            <p className="font-semibold text-gray-900">Your Location</p>
                            <p className="text-sm text-gray-600">GS Officer Position</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                    
                    {/* Emergency location marker */}
                    {selectedEmergency.location?.coordinates?.coordinates && (
                      <Marker
                        position={[
                          selectedEmergency.location.coordinates.coordinates[1],
                          selectedEmergency.location.coordinates.coordinates[0],
                        ]}
                        icon={getMarkerIcon(selectedEmergency.emergencyType)}
                      >
                        <Popup>
                          <div className="min-w-[200px]">
                            <h3 className="font-bold text-gray-900 mb-2">{selectedEmergency.title}</h3>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Type:</span> {selectedEmergency.emergencyType}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Status:</span> 
                                <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${getStatusBadgeClass(selectedEmergency.status)}`}>
                                  {selectedEmergency.status.charAt(0).toUpperCase() + selectedEmergency.status.slice(1)}
                                </span>
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Severity:</span>
                                <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${getSeverityBadgeClass(selectedEmergency.severity)}`}>
                                  {selectedEmergency.severity.charAt(0).toUpperCase() + selectedEmergency.severity.slice(1)}
                                </span>
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Address:</span> {selectedEmergency.location.address}
                              </p>
                              {selectedEmergency.reporter?.fullName && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Reporter:</span> {selectedEmergency.reporter.fullName}
                                </p>
                              )}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                    
                    {/* Show routing if active */}
                    {routingActive &&
                      userCoordinates &&
                      selectedEmergency.location?.coordinates?.coordinates && (
                        <RoutingMachine
                          userCoords={userCoordinates}
                          emergencyCoords={[
                            selectedEmergency.location.coordinates.coordinates[1],
                            selectedEmergency.location.coordinates.coordinates[0],
                          ]}
                          setRoutingInfo={setRoutingInfo}
                        />
                      )}
                      
                    {/* Set view to selected emergency */}
                    {selectedEmergency.location?.coordinates?.coordinates && (
                      <SetViewOnClick
                        coords={[
                          selectedEmergency.location.coordinates.coordinates[1],
                          selectedEmergency.location.coordinates.coordinates[0],
                        ]}
                      />
                    )}
                  </MapContainer>
                </div>
                
                {/* Navigation controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-4">
                  <div className="flex items-center space-x-3 flex-wrap gap-2">
                    <button
                      onClick={toggleRouting}
                      className={`nav-button px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        routingActive
                          ? "bg-primary text-white hover:bg-primary/90"
                          : "border border-primary text-primary hover:bg-primary hover:text-white"
                      }`}
                    >
                      {routingActive ? "Hide Route" : "Show Route"}
                    </button>
                    
                    <button
                      onClick={openExternalNavigation}
                      className="nav-button px-4 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors text-sm font-medium flex items-center"
                    >
                      Navigate
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                  
                  {routingInfo && (
                    <div className="route-info text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
                      <span className="mr-4 font-medium">Distance: {routingInfo.distance} km</span>
                      <span className="font-medium">Est. Time: {routingInfo.time} min</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Emergency details */}
              <div className="space-y-6">
                {/* Citizen/Reporter Information Section */}
                <div className="info-section bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <UserIcon className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-blue-900">Citizen Information</h3>
                  </div>
                  
                  {selectedEmergency.reporter ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-blue-700 font-medium mb-1">Full Name</p>
                        <p className="text-blue-900 font-semibold">{selectedEmergency.reporter.fullName}</p>
                      </div>
                      
                      {selectedEmergency.reporter.phoneNumber && (
                        <div>
                          <p className="text-sm text-blue-700 font-medium mb-1">Phone Number</p>
                          <div className="flex items-center justify-between">
                            <p className="text-blue-900 font-semibold">{selectedEmergency.reporter.phoneNumber}</p>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleCallCitizen(selectedEmergency.reporter.phoneNumber)}
                                className="contact-button p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                                title="Call Citizen"
                              >
                                <PhoneIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleMessageCitizen(selectedEmergency.reporter.phoneNumber)}
                                className="contact-button p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                                title="Send SMS"
                              >
                                <ChatBubbleLeftIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {selectedEmergency.reporter.email && (
                        <div>
                          <p className="text-sm text-blue-700 font-medium mb-1">Email Address</p>
                          <div className="flex items-center justify-between">
                            <p className="text-blue-900 font-semibold">{selectedEmergency.reporter.email}</p>
                            <button
                              onClick={() => handleEmailCitizen(selectedEmergency.reporter.email)}
                              className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                              title="Send Email"
                            >
                              <EnvelopeIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {selectedEmergency.reporter.nic && (
                        <div>
                          <p className="text-sm text-blue-700 font-medium mb-1">NIC Number</p>
                          <p className="text-blue-900 font-semibold">{selectedEmergency.reporter.nic}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Reporter information not available</p>
                    </div>
                  )}
                </div>

                {/* Emergency Details Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Type</p>
                      <p className="font-semibold text-gray-900">{selectedEmergency.emergencyType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Status</p>
                      <span
                        className={`inline-block px-3 py-1 text-sm rounded-full font-medium ${getStatusBadgeClass(
                          selectedEmergency.status
                        )}`}
                      >
                        {selectedEmergency.status.charAt(0).toUpperCase() +
                          selectedEmergency.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Severity</p>
                      <span
                        className={`inline-block px-3 py-1 text-sm rounded-full font-medium ${getSeverityBadgeClass(
                          selectedEmergency.severity
                        )}`}
                      >
                        {selectedEmergency.severity.charAt(0).toUpperCase() +
                          selectedEmergency.severity.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Reported On</p>
                      <p className="font-semibold text-gray-900">{formatDate(selectedEmergency.createdAt)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 font-medium">Address</p>
                      <p className="font-semibold text-gray-900">{selectedEmergency.location?.address}</p>
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedEmergency.description}</p>
                </div>

                {/* Emergency photos */}
                {selectedEmergency.photos &&
                  selectedEmergency.photos.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Photos</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {selectedEmergency.photos.map((photo, index) => (
                          <a
                            key={index}
                            href={`http://localhost:5000/${photo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block h-24 rounded-md overflow-hidden"
                          >
                            <img
                              src={`http://localhost:5000/${photo}`}
                              alt={`Emergency photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Notes section */}
                {selectedEmergency.notes &&
                  selectedEmergency.notes.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                      <div className="space-y-3">
                        {selectedEmergency.notes.map((note, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 p-3 rounded-md"
                          >
                            <p className="text-gray-700">{note.content}</p>
                            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                              <span>
                                By: {note.addedBy?.fullName || "Unknown"}
                              </span>
                              <span>{formatDate(note.addedAt)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* GS Officer Status Update Actions */}
                {userData?.role === "gs" &&
                  selectedEmergency.status !== "resolved" &&
                  selectedEmergency.status !== "archived" && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Update Emergency Status
                      </h3>
                      <form
                        onSubmit={handleStatusUpdate}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="status"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Status
                            </label>
                            <select
                              id="status"
                              name="status"
                              value={statusUpdateData.status}
                              onChange={handleStatusUpdateChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            >
                              <option value="">Select Status</option>
                              <option value="reported">Reported</option>
                              <option value="in-progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="archived">Archived</option>
                            </select>
                          </div>

                          <div>
                            <label
                              htmlFor="severity"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Severity
                            </label>
                            <select
                              id="severity"
                              name="severity"
                              value={statusUpdateData.severity}
                              onChange={handleStatusUpdateChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            >
                              <option value="">No Change</option>
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="critical">Critical</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="authorities"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Notify Authorities
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {emergencyAuthorities.map((authority) => (
                              <div
                                key={authority.id}
                                className="flex items-center"
                              >
                                <input
                                  type="checkbox"
                                  id={`authority-${authority.id}`}
                                  checked={(
                                    statusUpdateData.authorities || []
                                  ).includes(authority.id)}
                                  onChange={() =>
                                    toggleAuthority(authority.id)
                                  }
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label
                                  htmlFor={`authority-${authority.id}`}
                                  className="ml-2 text-sm text-gray-700"
                                >
                                  {authority.name} ({authority.phone})
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="notes"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Notes
                          </label>
                          <textarea
                            id="notes"
                            name="notes"
                            value={statusUpdateData.notes}
                            onChange={handleStatusUpdateChange}
                            required
                            rows={3}
                            placeholder="Add notes about this status update"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          ></textarea>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                          >
                            Update Status
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
              </div>
            </div>
          )}
        </main>
        <div className="fixed bottom-0 left-64 right-0 z-10">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default EmergencyReportGramasewaka;