// import { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import Sidebar from "../../components/sidebar/gramasewaka.sidebar";
// import Navbar from "../../components/navbar/gramasewaka.navbar";
// import Footer from "../../components/footer/gramasewaka.footer";
// // Fix the marker icon issues
// import icon from "leaflet/dist/images/marker-icon.png";
// import iconShadow from "leaflet/dist/images/marker-shadow.png";

// import {
//   BellAlertIcon,
//   MapPinIcon,
//   ExclamationTriangleIcon,
//   ClockIcon,
//   PaperClipIcon,
//   ChevronDownIcon,
//   XMarkIcon,
//   CheckCircleIcon,
//   FolderPlusIcon,
//   PhoneIcon,
//   ClipboardDocumentListIcon,
//   ArrowTopRightOnSquareIcon,
// } from "@heroicons/react/24/outline";
// import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// // Fix the import order - first import the CSS, then the JS
// import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
// // Don't directly import the module, we'll use it through L after it loads

// // Fix for the marker icon issue in Leaflet with webpack
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl:
//     "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
// });

// // Custom icons for different emergency types
// const emergencyIcons = {
//   "Natural Disaster": new L.Icon({
//     iconUrl:
//       "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
//     shadowUrl:
//       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//     popupAnchor: [1, -34],
//     shadowSize: [41, 41],
//   }),
//   Fire: new L.Icon({
//     iconUrl:
//       "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
//     shadowUrl:
//       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//     popupAnchor: [1, -34],
//     shadowSize: [41, 41],
//   }),
//   "Medical Emergency": new L.Icon({
//     iconUrl:
//       "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
//     shadowUrl:
//       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//     popupAnchor: [1, -34],
//     shadowSize: [41, 41],
//   }),
//   Crime: new L.Icon({
//     iconUrl:
//       "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png",
//     shadowUrl:
//       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//     popupAnchor: [1, -34],
//     shadowSize: [41, 41],
//   }),
//   default: new L.Icon({
//     iconUrl:
//       "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
//     shadowUrl:
//       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//     popupAnchor: [1, -34],
//     shadowSize: [41, 41],
//   }),
// };

// // Component to recenter the map to a given position
// function SetViewOnClick({ coords }) {
//   const map = useMap();

//   useEffect(() => {
//     if (coords && Array.isArray(coords) && coords.length === 2) {
//       map.setView(coords, 13);
//     }
//   }, [map, coords]);

//   return null;
// }

// // Component to show routing from user location to emergency location
// function RoutingMachine({ userCoords, emergencyCoords, setRoutingInfo }) {
//   const map = useMap();
//   const routingControlRef = useRef(null);

//   useEffect(() => {
//     if (!userCoords || !emergencyCoords) return;

//     // Make sure L.Routing is available
//     if (!L.Routing || !L.Routing.control) {
//       console.error("Leaflet Routing Machine not loaded properly");
//       return;
//     }

//     // Clean up previous routing control if it exists
//     if (routingControlRef.current) {
//       map.removeControl(routingControlRef.current);
//       routingControlRef.current = null;
//     }

//     // Create waypoints
//     const waypoints = [
//       L.latLng(userCoords[0], userCoords[1]),
//       L.latLng(emergencyCoords[0], emergencyCoords[1]),
//     ];

//     // Create routing control
//     try {
//       const routingControl = L.Routing.control({
//         waypoints,
//         routeWhileDragging: false,
//         showAlternatives: true,
//         fitSelectedRoutes: true,
//         lineOptions: {
//           styles: [{ color: "#6366f1", opacity: 0.8, weight: 6 }],
//         },
//         createMarker: () => null, // We'll use our own markers
//       }).addTo(map);

//       routingControlRef.current = routingControl;

//       // Get route info when route is calculated
//       routingControl.on("routesfound", (e) => {
//         const routes = e.routes;
//         const summary = routes[0].summary;

//         setRoutingInfo({
//           distance: (summary.totalDistance / 1000).toFixed(2), // km
//           duration: Math.round(summary.totalTime / 60), // minutes
//           instructions: routes[0].instructions,
//         });
//       });
//     } catch (err) {
//       console.error("Error creating routing control:", err);
//     }

//     return () => {
//       if (routingControlRef.current) {
//         map.removeControl(routingControlRef.current);
//       }
//     };
//   }, [map, userCoords, emergencyCoords, setRoutingInfo]);

//   return null;
// }

// const EmergencyReports = () => {
//   const [userData, setUserData] = useState(null);
//   const [emergencies, setEmergencies] = useState([]);
//   const [emergencyTypes, setEmergencyTypes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState("recent");
//   const [showReportForm, setShowReportForm] = useState(false);
//   const [selectedEmergency, setSelectedEmergency] = useState(null);
//   const [mapPosition, setMapPosition] = useState([7.8731, 80.7718]); // Sri Lanka center
//   const [userCoordinates, setUserCoordinates] = useState(null);
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [typeFilter, setTypeFilter] = useState("all");
//   const [routingActive, setRoutingActive] = useState(false);
//   const [routingInfo, setRoutingInfo] = useState(null);
//   const [authoritiesContacted, setAuthoritiesContacted] = useState({});
//   const fileInputRef = useRef(null);
//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();

//   // Form state for new emergency report
//   const [formData, setFormData] = useState({
//     emergencyType: "",
//     title: "",
//     description: "",
//     address: "",
//     coordinates: "",
//     severity: "medium",
//     photos: [],
//   });

//   // Status update form state
//   const [statusUpdateData, setStatusUpdateData] = useState({
//     status: "",
//     severity: "",
//     notes: "",
//     authorities: [], // New field for tracking which authorities are notified
//   });

//   // List of emergency authorities
//   const emergencyAuthorities = [
//     { id: "police", name: "Police Department", phone: "119" },
//     { id: "ambulance", name: "Ambulance Service", phone: "110" },
//     { id: "fire", name: "Fire Department", phone: "111" },
//     { id: "disaster", name: "Disaster Management Center", phone: "117" },
//   ];

//   // Get user data from localStorage
//   useEffect(() => {
//     const storedUserData = localStorage.getItem("userData");
//     if (storedUserData) {
//       setUserData(JSON.parse(storedUserData));
//     }

//     // Get user's current location
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const { latitude, longitude } = position.coords;
//           setUserCoordinates([latitude, longitude]);
//         },
//         (error) => {
//           console.error("Error getting location:", error);
//         }
//       );
//     }
//   }, []);

//   // Fetch emergency types
//   useEffect(() => {
//     const fetchEmergencyTypes = async () => {
//       try {
//         const response = await fetch(
//           "http://localhost:5000/api/emergencies/types"
//         );
//         if (!response.ok) {
//           throw new Error("Failed to fetch emergency types");
//         }
//         const data = await response.json();
//         setEmergencyTypes(data);
//       } catch (err) {
//         console.error("Error fetching emergency types:", err);
//       }
//     };

//     fetchEmergencyTypes();
//   }, []);

//   // Fetch emergencies based on active tab
//   useEffect(() => {
//     const fetchEmergencies = async () => {
//       try {
//         setLoading(true);
//         let endpoint = "";

//         if (activeTab === "recent") {
//           endpoint = "http://localhost:5000/api/emergencies/recent";
//         } else {
//           // Build query for filtered view
//           const queryParams = new URLSearchParams();

//           if (statusFilter !== "all") {
//             queryParams.append("status", statusFilter);
//           }

//           if (typeFilter !== "all") {
//             queryParams.append("type", typeFilter);
//           }

//           endpoint = `http://localhost:5000/api/emergencies?${queryParams.toString()}`;
//         }

//         const response = await fetch(endpoint, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (!response.ok) {
//           throw new Error("Failed to fetch emergencies");
//         }

//         const data = await response.json();
//         // Handle different response structures
//         const emergencyList = data.emergencies || data;
//         setEmergencies(emergencyList);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (token) {
//       fetchEmergencies();
//     }
//   }, [activeTab, statusFilter, typeFilter, token]);

//   // Handle form input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   // Handle status update input changes
//   const handleStatusUpdateChange = (e) => {
//     const { name, value } = e.target;
//     setStatusUpdateData({
//       ...statusUpdateData,
//       [name]: value,
//     });
//   };

//   // Toggle authority in status update
//   const toggleAuthority = (authorityId) => {
//     setStatusUpdateData((prev) => {
//       const authorities = prev.authorities || [];
//       if (authorities.includes(authorityId)) {
//         return {
//           ...prev,
//           authorities: authorities.filter((id) => id !== authorityId),
//         };
//       } else {
//         return {
//           ...prev,
//           authorities: [...authorities, authorityId],
//         };
//       }
//     });
//   };

//   // Handle file selection
//   const handleFileChange = (e) => {
//     setFormData({
//       ...formData,
//       photos: e.target.files,
//     });
//   };

//   // Handle form submission for new emergency report
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!userCoordinates) {
//       alert("Location coordinates are required. Please allow location access.");
//       return;
//     }

//     try {
//       const submissionFormData = new FormData();
//       submissionFormData.append("emergencyType", formData.emergencyType);
//       submissionFormData.append("title", formData.title);
//       submissionFormData.append("description", formData.description);
//       submissionFormData.append("address", formData.address);
//       submissionFormData.append(
//         "coordinates",
//         JSON.stringify(userCoordinates.reverse())
//       ); // Convert to [lng, lat]
//       submissionFormData.append("severity", formData.severity);

//       // Append photos if any
//       if (formData.photos) {
//         for (let i = 0; i < formData.photos.length; i++) {
//           submissionFormData.append("photos", formData.photos[i]);
//         }
//       }

//       const response = await fetch("http://localhost:5000/api/emergencies", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: submissionFormData,
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(
//           errorData.message || "Failed to submit emergency report"
//         );
//       }

//       const result = await response.json();

//       // Reset form and close it
//       setFormData({
//         emergencyType: "",
//         title: "",
//         description: "",
//         address: "",
//         coordinates: "",
//         severity: "medium",
//         photos: [],
//       });
//       setShowReportForm(false);

//       // Refresh emergencies list
//       setActiveTab("recent");

//       alert("Emergency report submitted successfully!");
//     } catch (err) {
//       setError(err.message);
//       alert(`Error: ${err.message}`);
//     }
//   };

//   // Handle status update for an emergency
//   const handleStatusUpdate = async (e) => {
//     e.preventDefault();

//     if (!selectedEmergency) return;

//     try {
//       const response = await fetch(
//         `http://localhost:5000/api/emergencies/${selectedEmergency._id}/status`,
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             ...statusUpdateData,
//             notifiedAuthorities: statusUpdateData.authorities,
//           }),
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to update status");
//       }

//       // Update the emergency in the list
//       setEmergencies(
//         emergencies.map((emergency) =>
//           emergency._id === selectedEmergency._id
//             ? {
//                 ...emergency,
//                 status: statusUpdateData.status,
//                 severity: statusUpdateData.severity || emergency.severity,
//                 notifiedAuthorities: statusUpdateData.authorities || [],
//               }
//             : emergency
//         )
//       );

//       // Record which authorities were contacted
//       if (
//         statusUpdateData.authorities &&
//         statusUpdateData.authorities.length > 0
//       ) {
//         setAuthoritiesContacted((prev) => ({
//           ...prev,
//           [selectedEmergency._id]: [
//             ...(prev[selectedEmergency._id] || []),
//             ...statusUpdateData.authorities,
//           ],
//         }));
//       }

//       // Reset form
//       setStatusUpdateData({
//         status: "",
//         severity: "",
//         notes: "",
//         authorities: [],
//       });

//       // Refresh the selected emergency details
//       await fetchEmergencyDetails(selectedEmergency._id);

//       alert("Emergency status updated successfully!");
//     } catch (err) {
//       setError(err.message);
//       alert(`Error: ${err.message}`);
//     }
//   };

//   // Fetch details of a specific emergency
//   const fetchEmergencyDetails = async (id) => {
//     try {
//       setLoading(true);

//       const response = await fetch(
//         `http://localhost:5000/api/emergencies/${id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch emergency details");
//       }

//       const data = await response.json();
//       setSelectedEmergency(data);

//       // Set map position to the emergency location
//       if (
//         data.location &&
//         data.location.coordinates &&
//         data.location.coordinates.coordinates
//       ) {
//         const [lng, lat] = data.location.coordinates.coordinates;
//         setMapPosition([lat, lng]);
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // View details of an emergency
//   const viewEmergencyDetails = (id) => {
//     fetchEmergencyDetails(id);
//     // Reset routing when selecting a new emergency
//     setRoutingActive(false);
//     setRoutingInfo(null);
//   };

//   // Get appropriate icon for emergency type
//   const getMarkerIcon = (type) => {
//     return emergencyIcons[type] || emergencyIcons.default;
//   };

//   // Toggle routing to emergency location
//   const toggleRouting = () => {
//     setRoutingActive(!routingActive);
//   };

//   // Get status badge class
//   const getStatusBadgeClass = (status) => {
//     switch (status) {
//       case "reported":
//         return "bg-yellow-100 text-yellow-800";
//       case "in-progress":
//         return "bg-blue-100 text-blue-800";
//       case "resolved":
//         return "bg-green-100 text-green-800";
//       case "archived":
//         return "bg-gray-100 text-gray-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   // Get severity badge class
//   const getSeverityBadgeClass = (severity) => {
//     switch (severity) {
//       case "low":
//         return "bg-green-100 text-green-800";
//       case "medium":
//         return "bg-yellow-100 text-yellow-800";
//       case "high":
//         return "bg-orange-100 text-orange-800";
//       case "critical":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-yellow-100 text-yellow-800";
//     }
//   };

//   // Format date
//   const formatDate = (dateString) => {
//     const options = {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   // Open navigation in external app
//   const openExternalNavigation = () => {
//     if (
//       !selectedEmergency ||
//       !selectedEmergency.location?.coordinates?.coordinates
//     )
//       return;

//     const [lng, lat] = selectedEmergency.location.coordinates.coordinates;
//     const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
//     window.open(url, "_blank");
//   };

//   // Make sure Leaflet and Routing Machine are properly loaded
//   useEffect(() => {
//     const loadLeafletRouting = async () => {
//       try {
//         await import("leaflet-routing-machine");
//       } catch (error) {
//         console.error("Failed to load leaflet-routing-machine:", error);
//       }
//     };

//     loadLeafletRouting();
//   }, []);

//   let DefaultIcon = L.icon({
//     iconUrl: icon,
//     shadowUrl: iconShadow,
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//   });

//   L.Marker.prototype.options.icon = DefaultIcon;

//   return (
//     <div className="flex min-h-screen bg-light">
//       <Sidebar />
//       <div className="ml-64 w-full">
//         <Navbar userFullName={userData?.fullName} userRole={userData?.role} />
//         <main className="p-6 mt-16 mb-16">
//           <div className="flex justify-between items-center mb-6">
//             <h1 className="text-2xl font-bold text-primary">
//               Emergency Reports
//             </h1>
//             <button
//               onClick={() => {
//                 if (userCoordinates) {
//                   setShowReportForm(!showReportForm);
//                 } else {
//                   alert("Please allow location access to report an emergency");
//                 }
//               }}
//               className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
//             >
//               <BellAlertIcon className="w-5 h-5 mr-2" />
//               Report Emergency
//             </button>
//           </div>

//           {/* Emergency Report Form */}
//           {showReportForm && (
//             <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-xl font-semibold text-primary">
//                   Report New Emergency
//                 </h2>
//                 <button
//                   onClick={() => setShowReportForm(false)}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   <XMarkIcon className="w-6 h-6" />
//                 </button>
//               </div>

//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label
//                       htmlFor="emergencyType"
//                       className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                       Emergency Type
//                     </label>
//                     <select
//                       id="emergencyType"
//                       name="emergencyType"
//                       value={formData.emergencyType}
//                       onChange={handleChange}
//                       required
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
//                     >
//                       <option value="">Select Emergency Type</option>
//                       {emergencyTypes.map((type) => (
//                         <option key={type.id} value={type.id}>
//                           {type.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label
//                       htmlFor="severity"
//                       className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                       Severity
//                     </label>
//                     <select
//                       id="severity"
//                       name="severity"
//                       value={formData.severity}
//                       onChange={handleChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
//                     >
//                       <option value="low">Low</option>
//                       <option value="medium">Medium</option>
//                       <option value="high">High</option>
//                       <option value="critical">Critical</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="title"
//                     className="block text-sm font-medium text-gray-700 mb-1"
//                   >
//                     Title
//                   </label>
//                   <input
//                     id="title"
//                     name="title"
//                     type="text"
//                     value={formData.title}
//                     onChange={handleChange}
//                     required
//                     maxLength={100}
//                     placeholder="Brief title of the emergency"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
//                   />
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="description"
//                     className="block text-sm font-medium text-gray-700 mb-1"
//                   >
//                     Description
//                   </label>
//                   <textarea
//                     id="description"
//                     name="description"
//                     value={formData.description}
//                     onChange={handleChange}
//                     required
//                     rows={3}
//                     maxLength={1000}
//                     placeholder="Detailed description of the emergency"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
//                   ></textarea>
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="address"
//                     className="block text-sm font-medium text-gray-700 mb-1"
//                   >
//                     Address
//                   </label>
//                   <input
//                     id="address"
//                     name="address"
//                     type="text"
//                     value={formData.address}
//                     onChange={handleChange}
//                     required
//                     placeholder="Location address"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Location
//                   </label>
//                   <div className="h-64 bg-gray-100 rounded-md overflow-hidden">
//                     {userCoordinates && (
//                       <MapContainer
//                         center={userCoordinates}
//                         zoom={15}
//                         style={{ height: "100%", width: "100%" }}
//                       >
//                         <TileLayer
//                           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                         />
//                         <Marker position={userCoordinates}>
//                           <Popup>Your current location</Popup>
//                         </Marker>
//                       </MapContainer>
//                     )}
//                   </div>
//                   <p className="text-sm text-gray-500 mt-1">
//                     {userCoordinates
//                       ? `Using your current location: ${userCoordinates[0].toFixed(
//                           6
//                         )}, ${userCoordinates[1].toFixed(6)}`
//                       : "Location access is required to report an emergency"}
//                   </p>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Photos (Optional)
//                   </label>
//                   <div className="flex items-center">
//                     <button
//                       type="button"
//                       onClick={() => fileInputRef.current.click()}
//                       className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center"
//                     >
//                       <PaperClipIcon className="w-5 h-5 mr-2" />
//                       Attach Photos
//                     </button>
//                     <input
//                       type="file"
//                       ref={fileInputRef}
//                       onChange={handleFileChange}
//                       multiple
//                       accept="image/*"
//                       className="hidden"
//                     />
//                     <span className="ml-3 text-sm text-gray-500">
//                       {formData.photos && formData.photos.length > 0
//                         ? `${formData.photos.length} file(s) selected`
//                         : "No files selected"}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="flex justify-end pt-4">
//                   <button
//                     type="button"
//                     onClick={() => setShowReportForm(false)}
//                     className="px-4 py-2 mr-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
//                   >
//                     Submit Report
//                   </button>
//                 </div>
//               </form>
//             </div>
//           )}

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Left column - Emergency list */}
//             <div className="lg:col-span-1">
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <div className="flex border-b mb-4">
//                   <button
//                     className={`px-4 py-2 ${
//                       activeTab === "recent"
//                         ? "border-b-2 border-primary text-primary font-medium"
//                         : "text-gray-500"
//                     }`}
//                     onClick={() => setActiveTab("recent")}
//                   >
//                     Recent
//                   </button>
//                   <button
//                     className={`px-4 py-2 ${
//                       activeTab === "all"
//                         ? "border-b-2 border-primary text-primary font-medium"
//                         : "text-gray-500"
//                     }`}
//                     onClick={() => setActiveTab("all")}
//                   >
//                     All Emergencies
//                   </button>
//                 </div>

//                 {activeTab === "all" && (
//                   <div className="flex flex-wrap gap-2 mb-4">
//                     <select
//                       value={statusFilter}
//                       onChange={(e) => setStatusFilter(e.target.value)}
//                       className="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
//                     >
//                       <option value="all">All Statuses</option>
//                       <option value="reported">Reported</option>
//                       <option value="in-progress">In Progress</option>
//                       <option value="resolved">Resolved</option>
//                       <option value="archived">Archived</option>
//                     </select>

//                     <select
//                       value={typeFilter}
//                       onChange={(e) => setTypeFilter(e.target.value)}
//                       className="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
//                     >
//                       <option value="all">All Types</option>
//                       {emergencyTypes.map((type) => (
//                         <option key={type.id} value={type.id}>
//                           {type.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 )}

//                 {loading ? (
//                   <div className="text-center py-10">
//                     <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
//                     <p className="mt-2 text-gray-500">Loading emergencies...</p>
//                   </div>
//                 ) : error ? (
//                   <div className="bg-red-50 text-red-600 p-4 rounded-md">
//                     {error}
//                   </div>
//                 ) : emergencies.length === 0 ? (
//                   <div className="text-center py-10">
//                     <ExclamationTriangleIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
//                     <p className="text-gray-500">No emergencies found</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4 max-h-[70vh] overflow-y-auto">
//                     {emergencies.map((emergency) => (
//                       <div
//                         key={emergency._id}
//                         className={`p-4 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors ${
//                           selectedEmergency?._id === emergency._id
//                             ? "bg-gray-50 border-primary"
//                             : ""
//                         }`}
//                         onClick={() => viewEmergencyDetails(emergency._id)}
//                       >
//                         <div className="flex justify-between items-start">
//                           <div>
//                             <h3 className="font-medium text-gray-900 truncate">
//                               {emergency.title}
//                             </h3>
//                             <span
//                               className={`inline-block px-2 py-0.5 text-xs rounded-full ${getStatusBadgeClass(
//                                 emergency.status
//                               )}`}
//                             >
//                               {emergency.status.charAt(0).toUpperCase() +
//                                 emergency.status.slice(1)}
//                             </span>
//                           </div>
//                           <div className="flex items-center mt-1 text-sm text-gray-500">
//                             <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
//                             {emergency.emergencyType}
//                             <span
//                               className={`ml-2 inline-block px-2 py-0.5 text-xs rounded-full ${getSeverityBadgeClass(
//                                 emergency.severity
//                               )}`}
//                             >
//                               {emergency.severity.charAt(0).toUpperCase() +
//                                 emergency.severity.slice(1)}
//                             </span>
//                           </div>
//                         </div>
//                         <div className="flex items-center mt-1 text-sm text-gray-500">
//                           <MapPinIcon className="w-4 h-4 mr-1" />
//                           <span className="truncate">
//                             {emergency.location?.address}
//                           </span>
//                         </div>
//                         <div className="flex items-center mt-1 text-sm text-gray-500">
//                           <ClockIcon className="w-4 h-4 mr-1" />
//                           {formatDate(emergency.createdAt)}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Right column - Map and details */}
//             <div className="lg:col-span-2">
//               {/* Map container */}
//               <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//                 <div className="flex justify-between items-center mb-4">
//                   <h2 className="text-xl font-semibold text-primary">
//                     Emergency Map
//                   </h2>

//                   {selectedEmergency && userCoordinates && (
//                     <div className="flex items-center">
//                       <button
//                         onClick={toggleRouting}
//                         className={`px-3 py-1 mr-2 rounded-md border ${
//                           routingActive
//                             ? "bg-primary text-white"
//                             : "text-primary border-primary"
//                         }`}
//                       >
//                         {routingActive ? "Hide Route" : "Show Route"}
//                       </button>

//                       <button
//                         onClick={openExternalNavigation}
//                         className="px-3 py-1 rounded-md text-blue-600 border border-blue-600 flex items-center"
//                       >
//                         Navigate{" "}
//                         <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {routingInfo && (
//                   <div className="mb-4 bg-blue-50 p-3 rounded-md">
//                     <div className="flex justify-between">
//                       <div>
//                         <p className="text-sm text-blue-600">
//                           <span className="font-medium">Distance:</span>{" "}
//                           {routingInfo.distance} km
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-blue-600">
//                           <span className="font-medium">Est. Time:</span>{" "}
//                           {routingInfo.time} min
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 <div className="h-96 bg-gray-100 rounded-md overflow-hidden">
//                   <MapContainer
//                     center={mapPosition}
//                     zoom={9}
//                     style={{ height: "100%", width: "100%" }}
//                   >
//                     <TileLayer
//                       attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                       url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                     />

//                     {/* User's current location */}
//                     {userCoordinates && (
//                       <Marker
//                         position={userCoordinates}
//                         icon={
//                           new L.Icon({
//                             iconUrl:
//                               "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
//                             shadowUrl:
//                               "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
//                             iconSize: [25, 41],
//                             iconAnchor: [12, 41],
//                             popupAnchor: [1, -34],
//                             shadowSize: [41, 41],
//                           })
//                         }
//                       >
//                         <Popup>Your current location</Popup>
//                       </Marker>
//                     )}

//                     {/* Emergency markers */}
//                     {emergencies.map((emergency) => {
//                       // Check if the emergency has coordinates
//                       if (emergency.location?.coordinates?.coordinates) {
//                         const [lng, lat] =
//                           emergency.location.coordinates.coordinates;
//                         return (
//                           <Marker
//                             key={emergency._id}
//                             position={[lat, lng]}
//                             icon={getMarkerIcon(emergency.emergencyType)}
//                             eventHandlers={{
//                               click: () => {
//                                 viewEmergencyDetails(emergency._id);
//                               },
//                             }}
//                           >
//                             <Popup>
//                               <div>
//                                 <h3 className="font-bold">{emergency.title}</h3>
//                                 <p className="text-sm">
//                                   {emergency.emergencyType}
//                                 </p>
//                                 <p className="text-sm">
//                                   {emergency.location.address}
//                                 </p>
//                                 <p className="text-sm">
//                                   Status: {emergency.status}
//                                 </p>
//                               </div>
//                             </Popup>
//                           </Marker>
//                         );
//                       }
//                       return null;
//                     })}

//                     {/* Routing between user and emergency location */}
//                     {routingActive &&
//                       userCoordinates &&
//                       selectedEmergency?.location?.coordinates?.coordinates && (
//                         <RoutingMachine
//                           userCoords={userCoordinates}
//                           emergencyCoords={[
//                             selectedEmergency.location.coordinates
//                               .coordinates[1],
//                             selectedEmergency.location.coordinates
//                               .coordinates[0],
//                           ]}
//                           setRoutingInfo={setRoutingInfo}
//                         />
//                       )}

//                     {/* Set view to selected emergency or user location */}
//                     {selectedEmergency &&
//                       selectedEmergency.location?.coordinates?.coordinates && (
//                         <SetViewOnClick
//                           coords={[
//                             selectedEmergency.location.coordinates
//                               .coordinates[1],
//                             selectedEmergency.location.coordinates
//                               .coordinates[0],
//                           ]}
//                         />
//                       )}
//                   </MapContainer>
//                 </div>
//               </div>

//               {/* Emergency details */}
//               {selectedEmergency ? (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <div className="flex justify-between items-start mb-4">
//                     <h2 className="text-xl font-semibold text-primary">
//                       {selectedEmergency.title}
//                     </h2>
//                     <div className="flex items-center space-x-2">
//                       <span
//                         className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusBadgeClass(
//                           selectedEmergency.status
//                         )}`}
//                       >
//                         {selectedEmergency.status.charAt(0).toUpperCase() +
//                           selectedEmergency.status.slice(1)}
//                       </span>
//                       <span
//                         className={`inline-block px-3 py-1 text-sm rounded-full ${getSeverityBadgeClass(
//                           selectedEmergency.severity
//                         )}`}
//                       >
//                         {selectedEmergency.severity.charAt(0).toUpperCase() +
//                           selectedEmergency.severity.slice(1)}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//                     <div>
//                       <p className="text-sm text-gray-500">Emergency Type</p>
//                       <p className="font-medium">
//                         {selectedEmergency.emergencyType}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Reported By</p>
//                       <p className="font-medium">
//                         {selectedEmergency.reporter?.fullName}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Contact</p>
//                       <p className="font-medium flex items-center">
//                         {selectedEmergency.reporter?.phoneNumber ||
//                           "Not provided"}
//                         {selectedEmergency.reporter?.phoneNumber && (
//                           <a
//                             href={`tel:${selectedEmergency.reporter.phoneNumber}`}
//                             className="ml-2 text-blue-600"
//                           >
//                             <PhoneIcon className="w-4 h-4" />
//                           </a>
//                         )}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Location</p>
//                       <p className="font-medium">
//                         {selectedEmergency.location?.address}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Reported On</p>
//                       <p className="font-medium">
//                         {formatDate(selectedEmergency.createdAt)}
//                       </p>
//                     </div>
//                     {selectedEmergency.assignedTo && (
//                       <div>
//                         <p className="text-sm text-gray-500">Assigned To</p>
//                         <p className="font-medium">
//                           {selectedEmergency.assignedTo.fullName}
//                         </p>
//                       </div>
//                     )}
//                     {selectedEmergency.resolvedAt && (
//                       <div>
//                         <p className="text-sm text-gray-500">Resolved On</p>
//                         <p className="font-medium">
//                           {formatDate(selectedEmergency.resolvedAt)}
//                         </p>
//                       </div>
//                     )}
//                   </div>

//                   <div className="mb-6">
//                     <p className="text-sm text-gray-500 mb-1">Description</p>
//                     <p className="text-gray-700 whitespace-pre-wrap">
//                       {selectedEmergency.description}
//                     </p>
//                   </div>

//                   {/* Emergency photos */}
//                   {selectedEmergency.photos &&
//                     selectedEmergency.photos.length > 0 && (
//                       <div className="mb-6">
//                         <p className="text-sm text-gray-500 mb-2">Photos</p>
//                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
//                           {selectedEmergency.photos.map((photo, index) => (
//                             <a
//                               key={index}
//                               href={`http://localhost:5000/${photo}`}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="block h-24 rounded-md overflow-hidden"
//                             >
//                               <img
//                                 src={`http://localhost:5000/${photo}`}
//                                 alt={`Emergency photo ${index + 1}`}
//                                 className="w-full h-full object-cover"
//                               />
//                             </a>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                   {/* Authorities contacted */}
//                   {selectedEmergency.notifiedAuthorities &&
//                     selectedEmergency.notifiedAuthorities.length > 0 && (
//                       <div className="mb-6">
//                         <p className="text-sm text-gray-500 mb-2">
//                           Authorities Notified
//                         </p>
//                         <div className="flex flex-wrap gap-2">
//                           {selectedEmergency.notifiedAuthorities.map(
//                             (authorityId) => {
//                               const authority = emergencyAuthorities.find(
//                                 (a) => a.id === authorityId
//                               );
//                               return authority ? (
//                                 <span
//                                   key={authorityId}
//                                   className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center"
//                                 >
//                                   <ClipboardDocumentListIcon className="w-3 h-3 mr-1" />
//                                   {authority.name}
//                                 </span>
//                               ) : null;
//                             }
//                           )}
//                         </div>
//                       </div>
//                     )}

//                   {/* Notes section */}
//                   {selectedEmergency.notes &&
//                     selectedEmergency.notes.length > 0 && (
//                       <div className="mb-6">
//                         <p className="text-sm text-gray-500 mb-2">Notes</p>
//                         <div className="space-y-3">
//                           {selectedEmergency.notes.map((note, index) => (
//                             <div
//                               key={index}
//                               className="bg-gray-50 p-3 rounded-md"
//                             >
//                               <p className="text-gray-700">{note.content}</p>
//                               <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
//                                 <span>
//                                   By: {note.addedBy?.fullName || "Unknown"}
//                                 </span>
//                                 <span>{formatDate(note.addedAt)}</span>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                   {/* GS Officer Actions */}
//                   {userData?.role === "gs" &&
//                     selectedEmergency.status !== "resolved" &&
//                     selectedEmergency.status !== "archived" && (
//                       <div className="border-t pt-4">
//                         <h3 className="font-medium text-gray-700 mb-3">
//                           Update Emergency Status
//                         </h3>
//                         <form
//                           onSubmit={handleStatusUpdate}
//                           className="space-y-4"
//                         >
//                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                             <div>
//                               <label
//                                 htmlFor="status"
//                                 className="block text-sm font-medium text-gray-700 mb-1"
//                               >
//                                 Status
//                               </label>
//                               <select
//                                 id="status"
//                                 name="status"
//                                 value={statusUpdateData.status}
//                                 onChange={handleStatusUpdateChange}
//                                 required
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
//                               >
//                                 <option value="">Select Status</option>
//                                 <option value="reported">Reported</option>
//                                 <option value="in-progress">In Progress</option>
//                                 <option value="resolved">Resolved</option>
//                                 <option value="archived">Archived</option>
//                               </select>
//                             </div>

//                             <div>
//                               <label
//                                 htmlFor="severity"
//                                 className="block text-sm font-medium text-gray-700 mb-1"
//                               >
//                                 Severity
//                               </label>
//                               <select
//                                 id="severity"
//                                 name="severity"
//                                 value={statusUpdateData.severity}
//                                 onChange={handleStatusUpdateChange}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
//                               >
//                                 <option value="">No Change</option>
//                                 <option value="low">Low</option>
//                                 <option value="medium">Medium</option>
//                                 <option value="high">High</option>
//                                 <option value="critical">Critical</option>
//                               </select>
//                             </div>
//                           </div>

//                           <div>
//                             <label
//                               htmlFor="authorities"
//                               className="block text-sm font-medium text-gray-700 mb-2"
//                             >
//                               Notify Authorities
//                             </label>
//                             <div className="grid grid-cols-2 gap-2">
//                               {emergencyAuthorities.map((authority) => (
//                                 <div
//                                   key={authority.id}
//                                   className="flex items-center"
//                                 >
//                                   <input
//                                     type="checkbox"
//                                     id={`authority-${authority.id}`}
//                                     checked={(
//                                       statusUpdateData.authorities || []
//                                     ).includes(authority.id)}
//                                     onChange={() =>
//                                       toggleAuthority(authority.id)
//                                     }
//                                     className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
//                                   />
//                                   <label
//                                     htmlFor={`authority-${authority.id}`}
//                                     className="ml-2 text-sm text-gray-700"
//                                   >
//                                     {authority.name} ({authority.phone})
//                                   </label>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>

//                           <div>
//                             <label
//                               htmlFor="notes"
//                               className="block text-sm font-medium text-gray-700 mb-1"
//                             >
//                               Notes
//                             </label>
//                             <textarea
//                               id="notes"
//                               name="notes"
//                               value={statusUpdateData.notes}
//                               onChange={handleStatusUpdateChange}
//                               required
//                               rows={3}
//                               placeholder="Add notes about this status update"
//                               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
//                             ></textarea>
//                           </div>

//                           <div className="flex justify-end">
//                             <button
//                               type="submit"
//                               className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
//                             >
//                               Update Status
//                             </button>
//                           </div>
//                         </form>
//                       </div>
//                     )}
//                 </div>
//               ) : (
//                 <div className="bg-white rounded-lg shadow-md p-6 text-center">
//                   <FolderPlusIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
//                   <p className="text-gray-500">
//                     Select an emergency to view details
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </main>
//         <Footer />
//       </div>
//     </div>
//   );
// };

// export default EmergencyReports;
