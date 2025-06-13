import React, { useEffect, useState } from 'react';
import { BsImages, BsPerson, BsGeoAlt } from 'react-icons/bs';
import { FaEdit, FaLock } from 'react-icons/fa';
import { PropagateLoader } from 'react-spinners';
import toast, { Toaster } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import {
  get_customer_info,
  update_customer_info,
  change_password,
  messageClear,
} from '../../store/reducers/authReducer';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useDispatch();
  const { userInfo, loading, error, success, passwordChange } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (localStorage.getItem('customerToken')) {
      console.log('[Profile] Fetching customer info');
      dispatch(get_customer_info());
    } else {
      console.warn('[Profile] No token found');
      toast.error('Please log in to view your profile');
    }
  }, [dispatch]);

  useEffect(() => {
    if (userInfo) {
      console.log('[Profile] Initializing formData:', {
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        address: userInfo.address,
      });
      setFormData({
        name: userInfo.name || '',
        email: userInfo.email || '',
        phone: userInfo.phone || '',
        address: {
          street: userInfo.address?.street || '',
          city: userInfo.address?.city || '',
          state: userInfo.address?.state || '',
          postalCode: userInfo.address?.postalCode || '',
          country: userInfo.address?.country || '',
        },
      });
    } else {
      console.warn('[Profile] No userInfo available');
    }
  }, [userInfo]);

  useEffect(() => {
    if (success) {
      console.log('[Profile] Success:', success);
      toast.success(success);
      dispatch(messageClear());
      if (activeTab === 'personal') setIsEditing(false);
    }
    if (error) {
      console.error('[Profile] Error:', error);
      toast.error(error);
      dispatch(messageClear());
      if (error === 'Session expired - please login again') {
        setTimeout(() => {
          localStorage.removeItem('customerToken');
          window.location.href = '/login';
        }, 2000);
      }
    }
    if (passwordChange.success) {
      console.log('[Profile] Password Success:', passwordChange.success);
      toast.success(passwordChange.success);
      dispatch(messageClear());
      setPasswordData({
        currentPassword: '',
        password: '',
        confirmPassword: '',
      });
    }
    if (passwordChange.error) {
      console.error('[Profile] Password Error:', passwordChange.error);
      toast.error(passwordChange.error);
      dispatch(messageClear());
    }
  }, [success, error, passwordChange.success, passwordChange.error, dispatch, activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePersonalSubmit = (e) => {
    e.preventDefault();

    if (!userInfo) {
      console.error('[Profile] Submission blocked: userInfo is null');
      toast.error('User data not loaded. Please try again.');
      return;
    }

    if (!formData.name || !formData.email) {
      console.warn('[Profile] Validation failed: missing name or email');
      toast.error('Name and email are required');
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
    };

    console.log('[Profile] Personal payload:', payload);
    dispatch(update_customer_info(payload));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (!userInfo) {
      console.error('[Profile] Submission blocked: userInfo is null');
      toast.error('User data not loaded. Please try again.');
      return;
    }

    if (!passwordData.currentPassword || !passwordData.password) {
      console.warn('[Profile] Validation failed: missing current or new password');
      toast.error('Current and new password are required');
      return;
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      console.warn('[Profile] Validation failed: passwords do not match');
      toast.error('New passwords do not match');
      return;
    }

    const payload = {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.password,
    };

    console.log('[Profile] Password payload:', payload);
    dispatch(change_password(payload));
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing && userInfo) {
      console.log('[Profile] Resetting formData on cancel');
      setFormData({
        name: userInfo.name || '',
        email: userInfo.email || '',
        phone: userInfo.phone || '',
        address: {
          street: userInfo.address?.street || '',
          city: userInfo.address?.city || '',
          state: userInfo.address?.state || '',
          postalCode: userInfo.address?.postalCode || '',
          country: userInfo.address?.country || '',
        },
      });
    }
  };

  if (!userInfo && !loading) {
    return (
      <div className="px-4 lg:px-8 py-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-lg font-medium text-gray-900">No User Data Available</h3>
          <p className="mt-2 text-sm text-gray-500">
            Please ensure you are logged in or try again later.
          </p>
          <Link to="/login" className="mt-4 inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PropagateLoader color="#3B82F6" />
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-8 py-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 h-32">
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                  <div className="relative h-32 w-32 rounded-full border-4 border-white bg-white shadow-lg">
                    <div className="flex items-center justify-center h-full w-full rounded-full bg-gray-200">
                      <BsImages className="text-4xl text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-20 pb-6 px-6 text-center">
                <h2 className="text-xl font-bold text-gray-800">{userInfo.name || 'N/A'}</h2>
                <p className="text-gray-600">{userInfo.email || 'N/A'}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                    activeTab === 'personal'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <BsPerson className="mr-2" />
                  Personal Information
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                    activeTab === 'password'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FaLock className="mr-2" />
                  Change Password
                </button>
              </nav>
            </div>
          </div>
          <div className="w-full lg:w-2/3">
            {activeTab === 'personal' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <BsPerson className="mr-2 text-blue-500" />
                    Personal Information
                  </h3>
                  <button
                    onClick={toggleEdit}
                    className="flex items-center text-sm text-blue-500 hover:text-blue-700"
                  >
                    <FaEdit className="mr-1" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>
                {isEditing ? (
                  <form onSubmit={handlePersonalSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          type="email"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          type="tel"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <input
                          name="street"
                          value={formData.address.street}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          name="city"
                          value={formData.address.city}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          name="state"
                          value={formData.address.state}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code
                        </label>
                        <input
                          name="postalCode"
                          value={formData.address.postalCode}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <input
                          name="country"
                          value={formData.address.country}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={toggleEdit}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70 min-w-[120px]"
                      >
                        {loading ? (
                          <PropagateLoader color="#ffffff" size={8} />
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{userInfo.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{userInfo.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-medium">{userInfo.phone || 'N/A'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">Address</p>
                        <div className="flex items-start mt-1">
                          <BsGeoAlt className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-medium">{userInfo.address?.street || 'N/A'}</p>
                            <p className="text-gray-600">
                              {userInfo.address?.city ? `${userInfo.address.city}, ` : ''}
                              {userInfo.address?.state || ''} {userInfo.address?.postalCode || ''}
                            </p>
                            <p className="text-gray-600">{userInfo.address?.country || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'password' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaLock className="mr-2 text-blue-500" />
                    Change Password
                  </h3>
                </div>
                <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={passwordData.password}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={passwordChange.loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70 min-w-[120px]"
                    >
                      {passwordChange.loading ? (
                        <PropagateLoader color="#ffffff" size={8} />
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;