import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import CitizenSidebar from '../../components/sidebar/citizen.sidebar';
import CitizenNavbar from '../../components/navbar/citizen.navbar';
import CitizenFooter from '../../components/footer/citizen.footer';
import { 
  MapPinIcon, 
  HomeIcon, 
  UserGroupIcon, 
  PlusIcon, 
  PhotoIcon, 
  TrashIcon, 
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to recenter map to user's coordinates
function SetViewOnClick({ coords }) {
  const map = useMap();

  useEffect(() => {
    if (coords && Array.isArray(coords) && coords.length === 2) {
      map.setView(coords, 16);
    }
  }, [map, coords]);

  return null;
}

// Component to show routing from user location to destination
function RoutingMachine({ start, end, setRouteInfo }) {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!start || !end) return;

    // Make sure L.Routing is available
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
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1])
      ];

      const routingControl = L.Routing.control({
        waypoints,
        routeWhileDragging: false,
        showAlternatives: true,
        fitSelectedRoutes: true,
        lineOptions: {
          styles: [{ color: "#6366f1", opacity: 0.8, weight: 6 }],
        },
        createMarker: () => null // We'll use our own markers
      }).addTo(map);

      routingControlRef.current = routingControl;

      // Get route info when route is calculated
      routingControl.on("routesfound", (e) => {
        const routes = e.routes;
        const summary = routes[0].summary;

        setRouteInfo({
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
  }, [map, start, end, setRouteInfo]);

  return null;
}

// Component for map marker selection
function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    }
  });

  async function reverseGeocode(lat, lng) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error("Error during reverse geocoding:", error);
    }
  }

  return position ? (
    <Marker 
      position={position}
      icon={new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })}
    >
      <Popup>Selected Location</Popup>
    </Marker>
  ) : null;
}

const GISMappingCitizen = () => {
  const [userData, setUserData] = useState(null);
  const [mapCenter, setMapCenter] = useState([7.8731, 80.7718]); // Sri Lanka center coordinates
  const [zoom, setZoom] = useState(9);
  const [userLocation, setUserLocation] = useState(null);
  const [registeredLocations, setRegisteredLocations] = useState([]);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    numberOfResidents: 1,
    image: null,
    imagePreview: null,
    addressDetails: {
      street: '',
      city: '',
      district: ''
    }
  });

  // Get user data and location
  useEffect(() => {
    // Get user data from localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setZoom(14);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }

    // Import leaflet routing machine
    const loadLeafletRouting = async () => {
      try {
        await import('leaflet-routing-machine');
      } catch (error) {
        console.error('Failed to load leaflet-routing-machine:', error);
      }
    };
    loadLeafletRouting();

    // Fetch registered locations
    fetchRegisteredLocations();
  }, []);

  // Fetch user's registered locations
  const fetchRegisteredLocations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      // This endpoint should only return locations owned by the authenticated user
      const response = await fetch('http://localhost:5000/api/locations/my-locations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 404) {
        console.error('API endpoint not found');
        setError('Location service endpoint not found. Please contact support.');
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch locations');
      }
      
      const data = await response.json();
      console.log("Raw location data:", data);
      
      // Make sure we handle both array and object responses
      const locationsArray = Array.isArray(data) ? data : data.locations || [];
      console.log("Processed location array:", locationsArray);
      
      // Filter to only show locations created by current user if needed
      // (This might be unnecessary if the API already filters by user)
      setRegisteredLocations(locationsArray);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('Failed to load your registered locations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Log registered locations for debugging
  useEffect(() => {
    console.log("Registered locations:", registeredLocations);
  }, [registeredLocations]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties like addressDetails.street
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!position) {
      setError('Please select a location on the map');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const locationData = new FormData();
      locationData.append('name', formData.name || 'My Home');
      // Change to 'Residential Area' which should be in the allowed enum values
      locationData.append('type', 'Residential Area');
      locationData.append('numberOfResidents', formData.numberOfResidents);
      locationData.append('coordinates', JSON.stringify([position[1], position[0]])); // [lng, lat] for GeoJSON
      
      // Add the required address fields
      locationData.append('address.street', formData.addressDetails.street || address);
      locationData.append('address.city', formData.addressDetails.city || 'City');
      locationData.append('address.district', formData.addressDetails.district || 'District');
      
      // Add image if exists
      if (formData.image) {
        locationData.append('image', formData.image);
      }

      const response = await fetch('http://localhost:5000/api/locations/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: locationData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register location');
      }

      // Reset form and state
      setFormData({
        name: '',
        numberOfResidents: 1,
        image: null,
        imagePreview: null,
        addressDetails: {
          street: '',
          city: '',
          district: ''
        }
      });
      setPosition(null);
      setAddress('');
      setShowRegisterForm(false);
      
      // Refresh locations
      await fetchRegisteredLocations();
      
      // Show success message
      setSuccessMessage('Location registered successfully! It will be reviewed by the Grama Sevaka.');
      setTimeout(() => setSuccessMessage(null), 5000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800'; // pending
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': 
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'rejected': 
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default: 
        return <ClockIcon className="w-5 h-5 text-yellow-600" />; // pending
    }
  };

  return (
    <div className="flex min-h-screen bg-light">
      <CitizenSidebar />
      <div className="ml-64 w-full">
        <CitizenNavbar userFullName={userData?.fullName} userRole="citizen" />
        <main className="p-6 mt-16 mb-16">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-primary">GIS & Mapping</h1>
            {!showRegisterForm && (
              <button 
                onClick={() => setShowRegisterForm(true)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
              >
                Register My Residence
              </button>
            )}
          </div>
          
          {error && (
            <div className="bg-red-50 p-4 rounded-md text-red-800 mb-4">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 p-4 rounded-md text-green-800 mb-4">
              {successMessage}
            </div>
          )}
          
          {/* Map and Registration Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side - Map */}
            <div className={`${showRegisterForm ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-primary mb-4 flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-2" />
                  Location Map
                </h2>
                
                <div className="h-[500px] rounded-lg overflow-hidden border">
                  <MapContainer 
                    center={mapCenter} 
                    zoom={zoom} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* User's current location marker */}
                    {userLocation && (
                      <Marker 
                        position={userLocation}
                        icon={new L.Icon({
                          iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
                          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
                          iconSize: [25, 41],
                          iconAnchor: [12, 41],
                          popupAnchor: [1, -34],
                          shadowSize: [41, 41],
                        })}
                      >
                        <Popup>You are here</Popup>
                      </Marker>
                    )}
                    
                    {/* Registered locations markers */}
                    {registeredLocations.map(location => {
                      if (location.coordinates?.coordinates && 
                          Array.isArray(location.coordinates.coordinates) && 
                          location.coordinates.coordinates.length === 2) {
                        const [lng, lat] = location.coordinates.coordinates;
                        console.log(`Rendering marker for ${location.name} at position:`, [lat, lng]);
                        return (
                          <Marker 
                            key={location._id}
                            position={[lat, lng]}
                            icon={
                              new L.Icon({
                                iconUrl: 
                                  location.status === 'confirmed' 
                                    ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png"
                                    : location.status === 'rejected'
                                    ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png"
                                    : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
                                shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
                                iconSize: [25, 41],
                                iconAnchor: [12, 41],
                                popupAnchor: [1, -34],
                                shadowSize: [41, 41],
                              })
                            }
                            eventHandlers={{
                              click: () => {
                                setSelectedLocation(location);
                              }
                            }}
                          >
                            <Popup>
                              <strong>{location.name || 'My Residence'}</strong>
                              <br />
                              {location.address?.street ? location.address.street : 'No address'}, 
                              {location.address?.city ? location.address.city : ''}
                              <br />
                              Status: {location.status}
                            </Popup>
                          </Marker>
                        );
                      } else {
                        console.warn("Invalid coordinates for location:", location);
                        return null;
                      }
                    })}
                    
                    {/* Marker for selecting location */}
                    {showRegisterForm && <LocationMarker position={position} setPosition={setPosition} />}
                    
                    {/* Show route between user location and selected location */}
                    {showRoute && userLocation && selectedLocation && selectedLocation.coordinates?.coordinates && (
                      <RoutingMachine 
                        start={userLocation} 
                        end={[
                          selectedLocation.coordinates.coordinates[1],
                          selectedLocation.coordinates.coordinates[0]
                        ]}
                        setRouteInfo={setRouteInfo}
                      />
                    )}
                  </MapContainer>
                </div>
                
                {/* Route info */}
                {routeInfo && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-800">Route Information</h3>
                    <p className="text-blue-700">Distance: {routeInfo.distance}</p>
                    <p className="text-blue-700">Duration: {routeInfo.duration}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Side - Register Form or Registered Locations */}
            {showRegisterForm ? (
              <div className="lg:col-span-1">
                {/* Registration Form */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-primary mb-4">Register Your Residence</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Residence Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., My Home"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Residents
                      </label>
                      <input
                        type="number"
                        name="numberOfResidents"
                        value={formData.numberOfResidents}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    
                    {/* Street address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="addressDetails.street"
                        value={formData.addressDetails.street}
                        onChange={handleInputChange}
                        placeholder="Enter your street address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    
                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="addressDetails.city"
                        value={formData.addressDetails.city}
                        onChange={handleInputChange}
                        placeholder="Enter your city"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    
                    {/* District */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        District
                      </label>
                      <input
                        type="text"
                        name="addressDetails.district"
                        value={formData.addressDetails.district}
                        onChange={handleInputChange}
                        placeholder="Enter your district"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location on Map
                      </label>
                      {position ? (
                        <div className="p-3 bg-blue-50 rounded-md text-blue-700 flex items-center">
                          <MapPinIcon className="w-5 h-5 mr-1" />
                          <span>
                            Selected at: {position[0].toFixed(6)}, {position[1].toFixed(6)}
                            <br />
                            {address ? address : "Click on the map to select your residence location"}
                          </span>
                        </div>
                      ) : (
                        <div className="p-3 bg-yellow-50 rounded-md text-yellow-700">
                          Click on the map to select your residence location
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image (Optional)
                      </label>
                      <input
                        type="file"
                        name="image"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            // Preview image
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData(prev => ({
                                ...prev,
                                image: file,
                                imagePreview: reader.result
                              }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        accept="image/*"
                      />
                      
                      {formData.imagePreview && (
                        <div className="mt-2">
                          <img 
                            src={formData.imagePreview} 
                            alt="Preview" 
                            className="max-w-full h-32 object-contain rounded-md" 
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowRegisterForm(false);
                          setPosition(null);
                          setAddress('');
                          setFormData({
                            name: '',
                            numberOfResidents: 1,
                            image: null,
                            imagePreview: null,
                            addressDetails: {
                              street: '',
                              city: '',
                              district: ''
                            }
                          });
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      
                      <button
                        type="submit"
                        disabled={!position || loading}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Submitting...' : 'Register Residence'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-3">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-primary mb-4">My Registered Locations</h2>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading your registered locations...</p>
                    </div>
                  ) : registeredLocations.length === 0 ? (
                    <div className="text-center py-8">
                      <HomeIcon className="w-12 h-12 text-gray-400 mx-auto" />
                      <p className="mt-2 text-gray-500">You haven't registered any locations yet</p>
                      <button 
                        onClick={() => setShowRegisterForm(true)}
                        className="mt-3 px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
                      >
                        Register Now
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {registeredLocations.map(location => (
                        <div 
                          key={location._id} 
                          className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          {location.image ? (
                            <img 
                              src={`http://localhost:5000${location.image}`} 
                              alt={location.name} 
                              className="w-full h-32 object-cover"
                            />
                          ) : (
                            <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                              <HomeIcon className="w-10 h-10 text-gray-400" />
                            </div>
                          )}
                          
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium">{location.name || 'My Residence'}</h3>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(location.status)}`}>
                                {getStatusIcon(location.status)}
                                <span className="ml-1">
                                  {location.status === 'confirmed' ? 'Confirmed' : 
                                  location.status === 'rejected' ? 'Rejected' : 'Pending'}
                                </span>
                              </span>
                            </div>
                            
                            {/* THIS IS WHERE THE ERROR IS HAPPENING */}
                            {/* Change this line: */}
                            {/* <p className="text-sm text-gray-600">{location.address || 'No address'}</p> */}
                            {/* To this: */}
                            <p className="text-sm text-gray-600">
                              {location.address && (
                                <>
                                  {location.address.street ? `${location.address.street}, ` : ''}
                                  {location.address.city ? `${location.address.city}, ` : ''}
                                  {location.address.district || 'No address'}
                                </>
                              )}
                              {!location.address && 'No address information'}
                            </p>
                            
                            <p className="text-sm text-gray-500 mt-1">
                              {location.numberOfResidents || 1} residents
                            </p>
                            
                            {location.status === 'rejected' && location.notes && (
                              <div className="mt-2 p-2 bg-red-50 rounded-md text-sm text-red-700">
                                Rejection reason: {location.notes}
                              </div>
                            )}
                            
                            <div className="mt-3 flex justify-end">
                              <button
                                onClick={() => {
                                  setSelectedLocation(location);
                                  if (location.coordinates?.coordinates) {
                                    const [lng, lat] = location.coordinates.coordinates;
                                    setMapCenter([lat, lng]);
                                    setZoom(16);
                                  }
                                }}
                                className="text-primary hover:text-secondary font-medium text-sm"
                              >
                                View on map
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
        <CitizenFooter />
      </div>
    </div>
  );
};

export default GISMappingCitizen;