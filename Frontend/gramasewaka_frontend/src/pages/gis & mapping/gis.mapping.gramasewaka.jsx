import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayerGroup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Fix the imports for leaflet.markercluster
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import Sidebar from '../../components/sidebar/gramasewaka.sidebar';
import Navbar from '../../components/navbar/gramasewaka.navbar';
import Footer from '../../components/footer/gramasewaka.footer';
import { 
  MapPinIcon, 
  HomeIcon, 
  UserGroupIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to recenter the map to a given position
function SetViewOnClick({ coords }) {
  const map = useMap();

  useEffect(() => {
    if (coords && Array.isArray(coords) && coords.length === 2) {
      map.setView(coords, 16);
    }
  }, [map, coords]);

  return null;
}

const GISMappingGramaSewaka = () => {
  const [userData, setUserData] = useState(null);
  const [mapCenter, setMapCenter] = useState([7.8731, 80.7718]); // Sri Lanka center
  const [zoom, setZoom] = useState(8);
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [successMessage, setSuccessMessage] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [statsData, setStatsData] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    rejected: 0
  });

  // Get user data
  useEffect(() => {
    // Get user data from localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    // Fetch all locations
    fetchLocations();
  }, []);
  
  // Update the useEffect to depend on specific state variables
  useEffect(() => {
    if (locations.length > 0) {
      applyFilters();
    }
  }, [locations, searchTerm, filterStatus, filterType]);

  // Calculate stats whenever locations change
  useEffect(() => {
    if (locations.length > 0) {
      calculateStats();
    }
  }, [locations]);

  // Fetch locations from the backend
  const fetchLocations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Create query parameters for filtering
      const params = new URLSearchParams();
      
      // Only add these parameters if they're set to non-default values
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterType !== 'all') params.append('type', filterType);
      
      // Make the API request with parameters
      const response = await fetch(`http://localhost:5000/api/locations/filter?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      
      const data = await response.json();
      
      // Extract locations array safely
      let locationsArray = [];
      if (data && data.locations && Array.isArray(data.locations)) {
        locationsArray = data.locations;
      } else if (Array.isArray(data)) {
        locationsArray = data;
      }
      
      // Set locations state
      setLocations(locationsArray);
      setFilteredLocations(locationsArray); // Set filtered locations directly from API
      
      setError(null);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError(err.message || 'Failed to load locations');
      setLocations([]);
      setFilteredLocations([]);
    } finally {
      setLoading(false);
    }
  };

  // Simplified as we're now relying on backend filtering
  const applyFilters = () => {
    // This could be used for any additional client-side filtering if needed
    setFilteredLocations(locations);
    calculateStats(locations);
  };

  // Calculate stats for the dashboard
  const calculateStats = (locationsToCount = null) => {
    // Use either the passed locations or all locations
    const locsToProcess = locationsToCount || locations;
    
    // Only process residences
    const residences = locsToProcess.filter(loc => loc && loc.isResidence);
    
    const stats = {
      total: residences.length,
      confirmed: residences.filter(loc => loc && loc.status === 'confirmed').length,
      pending: residences.filter(loc => loc && loc.status === 'pending').length,
      rejected: residences.filter(loc => loc && loc.status === 'rejected').length
    };
    
    console.log("Calculated stats:", stats);
    setStatsData(stats);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Update location status (confirm/reject)
  const updateLocationStatus = async (id, status) => {
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/locations/residences/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          notes: status === 'rejected' ? approvalNotes : undefined
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${status} location`);
      }
      
      const updatedLocation = await response.json();
      
      // Update locations state
      setLocations(prev => prev.map(loc => 
        loc._id === id ? updatedLocation : loc
      ));
      
      // Update selected location if it's the one being updated
      if (selectedLocation?._id === id) {
        setSelectedLocation(updatedLocation);
      }
      
      // Show success message
      setSuccessMessage(`Location ${status === 'confirmed' ? 'approved' : 'rejected'} successfully`);
      setTimeout(() => setSuccessMessage(null), 5000);
      
      setApprovalNotes('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete location
  const deleteLocation = async (id) => {
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/locations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete location');
      }
      
      // Remove location from state
      setLocations(prev => prev.filter(loc => loc._id !== id));
      
      // Clear selected location if it's the one being deleted
      if (selectedLocation?._id === id) {
        setSelectedLocation(null);
      }
      
      // Show success message
      setSuccessMessage('Location deleted successfully');
      setTimeout(() => setSuccessMessage(null), 5000);
      
      setShowConfirmDelete(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
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
        return <CheckIcon className="w-4 h-4" />;
      case 'rejected':
        return <XMarkIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  // Get marker icon
  const getMarkerIcon = (location) => {
    // Different colors for different status and types
    let iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
    
    if (location.isResidence) {
      // Residential locations
      switch (location.status) {
        case 'confirmed':
          iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';
          break;
        case 'rejected':
          iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
          break;
        default:
          iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png';
      }
    } else {
      // Non-residential locations
      switch (location.type) {
        case 'government':
          iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png';
          break;
        case 'business':
          iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';
          break;
        case 'emergency':
          iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
          break;
        default:
          iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
      }
    }
    
    return new L.Icon({
      iconUrl,
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterType('all');
    // The useEffect will trigger fetchLocations with cleared filters
  };

  // Get formatted address from address object
  const formatAddress = (address) => {
    if (!address) return 'No address';
    
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.district) parts.push(address.district);
    
    return parts.length > 0 ? parts.join(', ') : 'No address';
  };

  // Create a filtered items array
  const filteredItems = searchTerm.trim()
    ? locations.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // Add other searchable fields here
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : locations;

  return (
    <div className="flex min-h-screen bg-light">
      <Sidebar />
      <div className="ml-64 w-full">
        <Navbar userFullName={userData?.fullName} userRole={userData?.role} />
        <main className="p-6 mt-16 mb-16">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-primary">GIS & Mapping</h1>
            <a 
              href="/residences-approval" 
              className="text-primary hover:text-secondary"
            >
              Go to Residence Approvals
            </a>
          </div>

          {error && (
            <div className="bg-red-50 p-4 rounded-md text-red-800 mb-4 flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 p-4 rounded-md text-green-800 mb-4 flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              {successMessage}
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <HomeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Residences</p>
                <p className="text-2xl font-bold">{statsData.total}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Confirmed</p>
                <p className="text-2xl font-bold">{statsData.confirmed}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold">{statsData.pending}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow flex items-center">
              <div className="rounded-full bg-red-100 p-3 mr-4">
                <XCircleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold">{statsData.rejected}</p>
              </div>
            </div>
          </div>

          {/* Filter and search */}
          <div className="bg-white rounded-lg shadow-md mb-6 p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative w-full sm:w-64">
                  <input 
                    type="text" 
                    placeholder="Search locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rejected">Rejected</option>
                </select>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="all">All Types</option>
                  <option value="residence">Residences</option>
                  <option value="government">Government</option>
                  <option value="business">Business</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Locations List */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-primary mb-4">Locations</h2>
              
              {loading && filteredLocations.length === 0 ? (
                <div className="py-6 text-center">
                  <ArrowPathIcon className="w-8 h-8 mx-auto text-gray-400 animate-spin" />
                  <p className="text-gray-500 mt-2">Loading locations...</p>
                </div>
              ) : filteredLocations.length === 0 ? (
                <div className="py-6 text-center">
                  <MapPinIcon className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2">
                    {searchTerm.trim() || filterStatus !== 'all' || filterType !== 'all'
                      ? 'No locations match your filters'
                      : 'No locations found'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {filteredLocations.map((location) => (
                    <div 
                      key={location._id}
                      onClick={() => setSelectedLocation(location)}
                      className={`p-4 border rounded-md cursor-pointer hover:border-primary transition-all ${
                        selectedLocation?._id === location._id 
                          ? 'border-primary bg-blue-50' 
                          : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{location.name || 'Unnamed Location'}</h3>
                        {location.isResidence && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getStatusBadgeClass(location.status)}`}>
                            {getStatusIcon(location.status)}
                            <span className="ml-1">
                              {location.status === 'confirmed' ? 'Confirmed' : 
                               location.status === 'rejected' ? 'Rejected' : 'Pending'}
                            </span>
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        <span className="truncate">{formatAddress(location.address)}</span>
                      </div>

                      <div className="mt-2 flex justify-between items-center text-sm">
                        <span className="text-gray-500">
                          {location.isResidence ? 'Residence' : location.type || 'Other'}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {formatDate(location.createdAt || new Date())}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Map and Details */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-primary mb-4 flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-2" />
                  Location Map
                </h2>
                
                <div className="h-[400px] rounded-lg overflow-hidden border">
                  <MapContainer 
                    center={mapCenter} 
                    zoom={zoom} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Location markers */}
                    {filteredLocations.map((location) => {
                      if (location.coordinates?.coordinates) {
                        const [lng, lat] = location.coordinates.coordinates;
                        return (
                          <Marker 
                            key={location._id}
                            position={[lat, lng]}
                            icon={getMarkerIcon(location)}
                            eventHandlers={{
                              click: () => setSelectedLocation(location)
                            }}
                          >
                            <Popup>
                              <div>
                                <h3 className="font-medium">{location.name || 'Unnamed Location'}</h3>
                                <p className="text-sm">{formatAddress(location.address)}</p>
                                {location.isResidence && (
                                  <p className="text-sm mt-1">
                                    Status: <span className="font-medium">{location.status}</span>
                                  </p>
                                )}
                              </div>
                            </Popup>
                          </Marker>
                        );
                      }
                      return null;
                    })}
                    
                    {/* Update map view when selected location changes */}
                    {selectedLocation && selectedLocation.coordinates?.coordinates && (
                      <SetViewOnClick 
                        coords={[
                          selectedLocation.coordinates.coordinates[1], 
                          selectedLocation.coordinates.coordinates[0]
                        ]} 
                      />
                    )}
                  </MapContainer>
                </div>
              </div>

              {/* Selected location details */}
              {selectedLocation ? (
                <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-primary">
                      {selectedLocation.name || 'Location Details'}
                    </h2>
                    
                    {selectedLocation.isResidence && (
                      <div className={`inline-flex items-center px-3 py-1 rounded-full ${getStatusBadgeClass(selectedLocation.status)}`}>
                        {getStatusIcon(selectedLocation.status)}
                        <span className="ml-1 text-sm font-medium">
                          {selectedLocation.status === 'confirmed' ? 'Confirmed' : 
                           selectedLocation.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Location Type</p>
                      <p className="font-medium">
                        {selectedLocation.isResidence ? 'Residence' : selectedLocation.type || 'Other'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{formatAddress(selectedLocation.address)}</p>
                    </div>

                    {selectedLocation.isResidence && (
                      <>
                        <div>
                          <p className="text-sm text-gray-500">Residents</p>
                          <p className="font-medium">{selectedLocation.numberOfResidents || 1} person(s)</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">Registered By</p>
                          <p className="font-medium">{selectedLocation.createdBy?.fullName || 'Unknown'}</p>
                        </div>
                      </>
                    )}

                    <div>
                      <p className="text-sm text-gray-500">Registration Date</p>
                      <p className="font-medium">{formatDate(selectedLocation.createdAt)}</p>
                    </div>
                  </div>
                  
                  {/* Image if available */}
                  {selectedLocation.image && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Image</p>
                      <img 
                        src={`http://localhost:5000${selectedLocation.image}`} 
                        alt={selectedLocation.name} 
                        className="w-full max-w-md rounded-lg shadow-sm"
                      />
                    </div>
                  )}
                  
                  {/* Notes for rejected registrations */}
                  {selectedLocation.isResidence && selectedLocation.status === 'rejected' && selectedLocation.notes && (
                    <div className="mb-4 p-3 bg-red-50 rounded-md">
                      <p className="text-sm font-medium text-red-700 mb-1">Rejection Notes:</p>
                      <p className="text-sm text-red-700">{selectedLocation.notes}</p>
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  <div className="mt-6 border-t pt-4">
                    {selectedLocation.isResidence && selectedLocation.status === 'pending' && (
                      <div className="flex flex-col md:flex-row md:justify-between items-start gap-4">
                        <div className="w-full md:w-2/3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes (required for rejection)
                          </label>
                          <textarea
                            value={approvalNotes}
                            onChange={(e) => setApprovalNotes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="Add any notes about this location"
                          ></textarea>
                        </div>
                        
                        <div className="flex space-x-3 self-end">
                          <button
                            onClick={() => updateLocationStatus(selectedLocation._id, 'rejected')}
                            disabled={isProcessing || !approvalNotes.trim()}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                          >
                            {isProcessing ? (
                              <ArrowPathIcon className="w-5 h-5 mr-1 animate-spin" />
                            ) : (
                              <XMarkIcon className="w-5 h-5 mr-1" />
                            )}
                            Reject
                          </button>
                          <button
                            onClick={() => updateLocationStatus(selectedLocation._id, 'confirmed')}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                          >
                            {isProcessing ? (
                              <ArrowPathIcon className="w-5 h-5 mr-1 animate-spin" />
                            ) : (
                              <CheckIcon className="w-5 h-5 mr-1" />
                            )}
                            Confirm
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Delete button - always show for administrators */}
                    <div className="mt-4 flex justify-end">
                      {showConfirmDelete ? (
                        <div className="text-right">
                          <p className="text-sm text-red-600 mb-2">Are you sure you want to delete this location?</p>
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => setShowConfirmDelete(false)}
                              className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => deleteLocation(selectedLocation._id)}
                              disabled={isProcessing}
                              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                            >
                              {isProcessing ? (
                                <ArrowPathIcon className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <TrashIcon className="w-4 h-4 mr-1" />
                              )}
                              Confirm Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowConfirmDelete(true)}
                          className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <TrashIcon className="w-4 h-4 mr-1" />
                          Delete Location
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-md text-center mt-6">
                  <MapPinIcon className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2">Select a location to view details</p>
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default GISMappingGramaSewaka;