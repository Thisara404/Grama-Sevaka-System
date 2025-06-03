import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/sidebar/gramasewaka.sidebar';
import Navbar from '../../components/navbar/gramasewaka.navbar';
import Footer from '../../components/footer/gramasewaka.footer';
import { UserCircleIcon, PhoneIcon, IdentificationIcon, MapPinIcon, EnvelopeIcon, PencilIcon } from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      district: '',
      postalCode: ''
    }
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const navigate = useNavigate();

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }

        // Try to get user data from localStorage first
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
          
          // Initialize form data with stored user data
          setFormData({
            fullName: parsedUserData.fullName || '',
            email: parsedUserData.email || '',
            phoneNumber: parsedUserData.phoneNumber || '',
            address: {
              street: parsedUserData.address?.street || '',
              city: parsedUserData.address?.city || '',
              district: parsedUserData.address?.district || '',
              postalCode: parsedUserData.address?.postalCode || ''
            }
          });
        }

        // Fetch fresh data from API
        const response = await fetch('http://localhost:5000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          // Check if unauthorized (token expired)
          if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        setUserData(data);
        
        // Update localStorage with fresh data
        localStorage.setItem('userData', JSON.stringify(data));
        
        // Initialize form data with user data
        setFormData({
          fullName: data.fullName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          address: {
            street: data.address?.street || '',
            city: data.address?.city || '',
            district: data.address?.district || '',
            postalCode: data.address?.postalCode || ''
          }
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Updated submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateSuccess(false);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You are not logged in');
      }
      
      // Show loading state
      setLoading(true);
      
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        // Check if unauthorized (token expired)
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          navigate('/login');
          return;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedData = await response.json();
      setUserData(updatedData);
      setUpdateSuccess(true);
      setIsEditing(false);
      
      // Update the stored user data - preserve other fields
      const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      localStorage.setItem('userData', JSON.stringify({
        ...storedUserData,
        ...updatedData
      }));
      
      // Set a timeout to clear the success message
      setTimeout(() => setUpdateSuccess(false), 3000);
      setError(null);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    // Reset form data to current user data
    setFormData({
      fullName: userData.fullName || '',
      email: userData.email || '',
      phoneNumber: userData.phoneNumber || '',
      address: {
        street: userData.address?.street || '',
        city: userData.address?.city || '',
        district: userData.address?.district || '',
        postalCode: userData.address?.postalCode || ''
      }
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-light">
      <Sidebar />
      <div className="ml-64 w-full">
        <Navbar userFullName={userData?.fullName} userRole={userData?.role} />
        <main className="p-6 mt-16 mb-16">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-primary">My Profile</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
                >
                  <PencilIcon className="w-5 h-5 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-10">Loading profile data...</div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-md my-4">{error}</div>
            ) : (
              <>
                {updateSuccess && (
                  <div className="bg-green-50 text-green-600 p-4 rounded-md mb-6">
                    Profile updated successfully!
                  </div>
                )}

                {isEditing ? (
                  // Edit Profile Form
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <input
                          id="address.street"
                          name="address.street"
                          type="text"
                          value={formData.address.street}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          id="address.city"
                          name="address.city"
                          type="text"
                          value={formData.address.city}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="address.district" className="block text-sm font-medium text-gray-700 mb-1">
                          District
                        </label>
                        <input
                          id="address.district"
                          name="address.district"
                          type="text"
                          value={formData.address.district}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code
                        </label>
                        <input
                          id="address.postalCode"
                          name="address.postalCode"
                          type="text"
                          value={formData.address.postalCode}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  // Profile Display
                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                      <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-white text-3xl font-bold">
                        {userData.fullName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{userData.fullName}</h3>
                        <p className="text-gray-500">{userData.role === 'gs' ? 'Grama Sevaka Officer' : 'Citizen'}</p>
                        <p className="text-gray-500">Username: {userData.username}</p>
                        <p className="text-gray-500">NIC: {userData.nic}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-cream rounded-lg">
                        <h4 className="font-medium text-primary flex items-center mb-3">
                          <EnvelopeIcon className="w-5 h-5 mr-2" />
                          Contact Information
                        </h4>
                        <div className="space-y-2 pl-7">
                          <p><span className="font-medium">Email:</span> {userData.email}</p>
                          <p><span className="font-medium">Phone:</span> {userData.phoneNumber || 'Not provided'}</p>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-cream rounded-lg">
                        <h4 className="font-medium text-primary flex items-center mb-3">
                          <MapPinIcon className="w-5 h-5 mr-2" />
                          Address
                        </h4>
                        <div className="space-y-2 pl-7">
                          <p>
                            {userData.address?.street ? `${userData.address.street}, ` : ''}
                            {userData.address?.city ? `${userData.address.city}, ` : ''}
                            {userData.address?.district ? `${userData.address.district}, ` : ''}
                            {userData.address?.postalCode || ''}
                            {!userData.address?.street && !userData.address?.city && 
                              !userData.address?.district && !userData.address?.postalCode && 'Address not provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Account Actions */}
                    <div className="border-t pt-6 mt-6">
                      <h4 className="font-medium text-gray-700 mb-4">Account Actions</h4>
                      <div className="flex flex-wrap gap-3">
                        <button 
                          onClick={handleLogout}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                        >
                          Log Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default ProfilePage;