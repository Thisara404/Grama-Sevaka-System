import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  BellAlertIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const EmergencyForm = ({ onClose, onSubmit, userData }) => {
  const [formData, setFormData] = useState({
    emergencyType: "",
    title: "",
    description: "",
    address: "",
    coordinates: [7.8731, 80.7718], // Center of Sri Lanka as default
    severity: "medium",
    photos: [],
  });
  const [emergencyTypes, setEmergencyTypes] = useState([]);
  const [position, setPosition] = useState(formData.coordinates);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const fileInputRef = useRef(null);

  // Fetch emergency types from backend
  useEffect(() => {
    const fetchEmergencyTypes = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/emergencies/types');
        if (!response.ok) {
          throw new Error('Failed to fetch emergency types');
        }
        const data = await response.json();
        setEmergencyTypes(data);
      } catch (error) {
        console.error('Error fetching emergency types:', error);
      } finally {
        setIsLoadingTypes(false);
      }
    };
    
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          setFormData(prev => ({
            ...prev,
            coordinates: [latitude, longitude]
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }

    fetchEmergencyTypes();
  }, []);

  // Disable background page scrolling when the modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Re-enable scrolling when the modal is closed
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Map marker component
  function LocationMarker() {
    const map = useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        setFormData(prev => ({
          ...prev,
          coordinates: [lat, lng]
        }));
        // Reverse geocode to get address
        fetchAddress(lat, lng);
      },
    });

    return position ? (
      <Marker 
        position={position} 
        icon={new L.Icon({
          iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })}
      >
        <Popup>Emergency Location</Popup>
      </Marker>
    ) : null;
  }

  // Reverse geocode to get address from coordinates
  const fetchAddress = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        setFormData(prev => ({
          ...prev,
          address: data.display_name
        }));
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  // Search for location by name (limited to Sri Lanka)
  const searchLocation = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=lk&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching for location:", error);
    }
  };

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce the search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      searchLocation(query);
    }, 500);
  };

  // Select a location from search results
  const selectLocation = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setPosition([lat, lon]);
    setFormData(prev => ({
      ...prev,
      address: result.display_name,
      coordinates: [lat, lon]
    }));
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Create preview URLs
    const newUploadedImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setUploadedImages([...uploadedImages, ...newUploadedImages]);
  };

  // Remove uploaded image
  const removeImage = (index) => {
    const newImages = [...uploadedImages];
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setUploadedImages(newImages);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create formData for multipart/form-data
      const submitData = new FormData();
      submitData.append('emergencyType', formData.emergencyType);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('address', formData.address);
      submitData.append('coordinates', JSON.stringify(formData.coordinates));
      submitData.append('severity', formData.severity);
      
      // Append photos
      uploadedImages.forEach(img => {
        submitData.append('photos', img.file);
      });
      
      const response = await fetch('http://localhost:5000/api/emergencies', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: submitData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit emergency report');
      }
      
      const result = await response.json();
      
      // Clean up image URLs
      uploadedImages.forEach(img => URL.revokeObjectURL(img.preview));
      
      // Call onSubmit with the result
      onSubmit(result);
      onClose();
    } catch (error) {
      console.error('Error submitting emergency report:', error);
      alert(`Failed to submit report: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1000] p-4 isolate">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-[1001]">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold text-red-600 flex items-center">
            <BellAlertIcon className="h-6 w-6 mr-2" />
            Report Emergency
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column for form fields */}
            <div className="space-y-4">
              {/* Emergency Type */}
              <div>
                <label htmlFor="emergencyType" className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="emergencyType"
                  name="emergencyType"
                  required
                  value={formData.emergencyType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  disabled={isLoadingTypes}
                >
                  <option value="">Select emergency type</option>
                  {emergencyTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Brief title describing the emergency"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detailed description of the emergency situation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                ></textarea>
              </div>
              
              {/* Severity */}
              <div>
                <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <select
                  id="severity"
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              
              {/* Location Search */}
              <div>
                <label htmlFor="locationSearch" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="locationSearch"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search for a location in Sri Lanka"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                      {searchResults.map((result, index) => (
                        <div 
                          key={index}
                          onClick={() => selectLocation(result)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b text-sm"
                        >
                          {result.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Search for a location or click directly on the map
                </p>
              </div>
              
              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={2}
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full address of emergency location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                ></textarea>
              </div>
              
              {/* Photos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photos (Optional)
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    <PhotoIcon className="w-5 h-5 mr-2" />
                    Upload Photos
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                  <span className="text-xs text-gray-500">
                    Max 5 photos, JPEG or PNG
                  </span>
                </div>
                {uploadedImages.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={img.preview} 
                          alt={`Upload ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Right column for map */}
            <div className="bg-gray-100 rounded-lg">
              <div className="h-[400px] relative emergency-form-map">
                <MapContainer 
                  center={position} 
                  zoom={13} 
                  scrollWheelZoom={true} 
                  style={{ height: '100%', borderRadius: '0.5rem' }}
                  className="z-[1002]" // Adding a higher z-index
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker />
                </MapContainer>
                <div className="absolute bottom-2 left-2 bg-white px-3 py-2 rounded-lg shadow-md z-[1000] text-sm">
                  <p className="font-medium flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1 text-red-500" />
                    Click on the map to set the emergency location
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Emergency Note */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="flex items-start text-sm">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-yellow-700">Important:</strong> This system is for reporting emergencies that require attention from local authorities. Providing accurate information will help responders act quickly. False reports may lead to legal consequences.
              </span>
            </p>
          </div>
          
          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-4 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <BellAlertIcon className="w-5 h-5 mr-2" />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmergencyForm;
