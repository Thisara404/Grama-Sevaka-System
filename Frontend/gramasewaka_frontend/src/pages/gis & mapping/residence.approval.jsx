import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Sidebar from '../../components/sidebar/gramasewaka.sidebar';
import Navbar from '../../components/navbar/gramasewaka.navbar';
import Footer from '../../components/footer/gramasewaka.footer';
import {
  MapPinIcon,
  HomeIcon,
  CheckIcon,
  XMarkIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

// Fix leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to set map view
function SetViewOnClick({ coords }) {
  const map = useMap();

  useEffect(() => {
    if (coords && Array.isArray(coords) && coords.length === 2) {
      map.setView(coords, 16);
    }
  }, [map, coords]);

  return null;
}

const ResidenceApproval = () => {
  const [userData, setUserData] = useState(null);
  const [residences, setResidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedResidence, setSelectedResidence] = useState(null);
  const [mapCenter, setMapCenter] = useState([7.8731, 80.7718]); // Sri Lanka center
  const [zoom, setZoom] = useState(9);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Get user data
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    
    // Fetch residences
    fetchResidences();
  }, [statusFilter]);

  // Fetch residence registrations
  const fetchResidences = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // This endpoint should return all residential locations
      const response = await fetch('http://localhost:5000/api/locations/residences', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch residences');
      }
      
      const data = await response.json();
      console.log('Fetched residence data:', data); // Add this line
      
      // Filter based on current statusFilter
      const filteredData = statusFilter === 'all' 
        ? data 
        : data.filter(residence => residence.status === statusFilter);
      
      setResidences(filteredData);
    } catch (err) {
      console.error('Error fetching residences:', err); // Add this line
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update residence status
  const updateResidenceStatus = async (id, status) => {
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
        throw new Error(`Failed to ${status} residence registration`);
      }
      
      const updatedResidence = await response.json();
      
      // Update residences list
      setResidences(prev => prev.filter(r => r._id !== id));
      
      // Update selected residence
      if (selectedResidence?._id === id) {
        setSelectedResidence(updatedResidence);
      }
      
      // Show success message
      setSuccessMessage(`Residence registration ${status === 'confirmed' ? 'approved' : 'rejected'} successfully`);
      setTimeout(() => setSuccessMessage(null), 5000);
      
      setApprovalNotes('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter residences by search term
  const filteredResidences = searchTerm.trim() 
    ? residences.filter(residence => 
        residence.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        residence.address?.street?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        residence.createdBy?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : residences;

  return (
    <div className="flex min-h-screen bg-light">
      <Sidebar />
      <div className="ml-64 w-full">
        <Navbar userFullName={userData?.fullName} userRole="gs" />
        <main className="p-6 mt-16 mb-16">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-primary">Residence Registrations</h1>
          </div>

          {error && (
            <div className="bg-red-50 p-4 rounded-md text-red-800 mb-4">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 p-4 rounded-md text-green-800 mb-4 flex items-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              {successMessage}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Registrations List */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-primary">Registrations</h2>
                
                <div className="relative">
                  <select 
                    className="appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 pl-3 pr-8 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-primary"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <FunnelIcon className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Search box */}
              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search registrations..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>

              {loading ? (
                <div className="py-6 text-center">
                  <ArrowPathIcon className="w-8 h-8 mx-auto text-gray-400 animate-spin" />
                  <p className="text-gray-500 mt-2">Loading registrations...</p>
                </div>
              ) : filteredResidences.length === 0 ? (
                <div className="py-6 text-center">
                  <HomeIcon className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2">
                    {searchTerm.trim() 
                      ? 'No matching registrations found' 
                      : 'No registrations found'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {filteredResidences.map((residence) => (
                    <div 
                      key={residence._id}
                      onClick={() => {
                        setSelectedResidence(residence);
                        if (residence.coordinates?.coordinates) {
                          const [lng, lat] = residence.coordinates.coordinates;
                          setMapCenter([lat, lng]);
                          setZoom(16);
                        }
                      }}
                      className={`p-4 border rounded-md cursor-pointer hover:border-primary transition-all ${
                        selectedResidence?._id === residence._id 
                          ? 'border-primary bg-blue-50' 
                          : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{residence.name || 'Unnamed Residence'}</h3>
                        <span className="text-xs text-gray-500">
                          {formatDate(residence.createdAt)}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        <span className="truncate">{residence.address?.street || 'No address'}</span>
                      </div>

                      <div className="mt-2 text-sm text-gray-500 flex justify-between">
                        <span className="flex items-center">
                          <UserGroupIcon className="w-4 h-4 mr-1" />
                          {residence.numberOfResidents || 1} resident(s)
                        </span>
                        {residence.status === 'pending' && (
                          <span className="flex items-center text-yellow-600">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            Pending Review
                          </span>
                        )}
                      </div>
                      
                      {residence.createdBy && (
                        <div className="mt-2 text-sm text-gray-500">
                          Registered by: {residence.createdBy.fullName}
                        </div>
                      )}
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
                    
                    {/* Residence markers */}
                    {residences.map((residence) => {
                      if (residence.coordinates?.coordinates) {
                        const [lng, lat] = residence.coordinates.coordinates;
                        return (
                          <Marker 
                            key={residence._id}
                            position={[lat, lng]}
                            icon={new L.Icon({
                              iconUrl: residence.status === 'confirmed' 
                                ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png"
                                : (residence.status === 'rejected'
                                    ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png"
                                    : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png"),
                              shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
                              iconSize: [25, 41],
                              iconAnchor: [12, 41],
                              popupAnchor: [1, -34],
                              shadowSize: [41, 41],
                            })}
                            eventHandlers={{
                              click: () => {
                                setSelectedResidence(residence);
                              },
                            }}
                          >
                            <Popup>
                              <div>
                                <h3 className="font-bold">{residence.name}</h3>
                                <p className="text-sm">{residence.address?.street}</p>
                                <p className="text-sm">Status: {residence.status || 'pending'}</p>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      }
                      return null;
                    })}
                    
                    {/* Update map view when selected residence changes */}
                    {selectedResidence && selectedResidence.coordinates?.coordinates && (
                      <SetViewOnClick 
                        coords={[
                          selectedResidence.coordinates.coordinates[1], 
                          selectedResidence.coordinates.coordinates[0]
                        ]} 
                      />
                    )}
                  </MapContainer>
                </div>
              </div>

              {/* Selected residence details */}
              {selectedResidence ? (
                <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-primary">
                      {selectedResidence.name || 'Residence Registration'}
                    </h2>
                    
                    <div>
                      {selectedResidence.status === 'pending' ? (
                        <div className="flex items-center bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          Pending Review
                        </div>
                      ) : selectedResidence.status === 'confirmed' ? (
                        <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                          <CheckIcon className="w-4 h-4 mr-1" />
                          Confirmed
                        </div>
                      ) : (
                        <div className="flex items-center bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm">
                          <XMarkIcon className="w-4 h-4 mr-1" />
                          Rejected
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{selectedResidence.address?.street || 'No address'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Registered By</p>
                      <p className="font-medium">{selectedResidence.createdBy?.fullName || 'Unknown'}</p>
                      {selectedResidence.createdBy?.email && (
                        <p className="text-sm text-gray-500">
                          {selectedResidence.createdBy.email}
                        </p>
                      )}
                      {selectedResidence.createdBy?.phoneNumber && (
                        <p className="text-sm text-gray-500">
                          {selectedResidence.createdBy.phoneNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Residents</p>
                      <p className="font-medium">{selectedResidence.numberOfResidents || 1} person(s)</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Registration Date</p>
                      <p className="font-medium">{formatDate(selectedResidence.createdAt)}</p>
                    </div>
                  </div>
                  
                  {/* Image if available */}
                  {selectedResidence.image && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Uploaded Image</p>
                      <img 
                        src={`http://localhost:5000${selectedResidence.image}`} 
                        alt="Residence" 
                        className="w-full max-w-md rounded-lg shadow-sm"
                      />
                    </div>
                  )}
                  
                  {/* Notes for rejected registrations */}
                  {selectedResidence.status === 'rejected' && selectedResidence.notes && (
                    <div className="mb-4 p-3 bg-red-50 rounded-md">
                      <p className="text-sm font-medium text-red-700 mb-1">Rejection Notes:</p>
                      <p className="text-sm text-red-700">{selectedResidence.notes}</p>
                    </div>
                  )}
                  
                  {/* Approval/Rejection controls */}
                  {selectedResidence.status === 'pending' && (
                    <div className="mt-6 border-t pt-4">
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
                            placeholder="Add any notes about this registration"
                          ></textarea>
                        </div>
                        
                        <div className="flex space-x-3 self-end">
                          <button
                            onClick={() => updateResidenceStatus(selectedResidence._id, 'rejected')}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                          >
                            {isProcessing ? (
                              <ArrowPathIcon className="w-5 h-5 mr-1 animate-spin" />
                            ) : (
                              <XMarkIcon className="w-5 h-5 mr-1" />
                            )}
                            Reject
                          </button>
                          <button
                            onClick={() => updateResidenceStatus(selectedResidence._id, 'confirmed')}
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
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-md mt-6 text-center">
                  <HomeIcon className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2">Select a residence registration to view details</p>
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

export default ResidenceApproval;