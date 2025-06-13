
import React, { useEffect, useState } from 'react';
import { BsImages, BsGlobe, BsCalendar, BsGeoAlt, BsBuildings } from 'react-icons/bs';
import { FaEdit, FaCar, FaMoneyBillWave, FaLock, FaEnvelope } from 'react-icons/fa';
import { PropagateLoader, FadeLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { 
  profile_image_upload, 
  messageClear, 
  update_business_info,
  update_password,
  update_email
} from '../../store/Reducers/authReducer';
import { create_stripe_connect_account } from '../../store/Reducers/sellerReducer';

const overrideStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 auto',
  height: '100%'
};

const Profile = () => {
  const [activeTab, setActiveTab] = useState('business');
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useDispatch();
  const { 
    userInfo, 
    imageLoading, 
    businessLoading, 
    passwordLoading, 
    emailLoading, 
    stripeLoading, 
    successMessage, 
    errorMessage 
  } = useSelector(state => state.auth);

  const [businessInfo, setBusinessInfo] = useState({
    agencyName: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: ''
    },
    taxId: '',
    businessLicense: '',
    description: '',
    fleetSize: 0,
    yearFounded: '',
    contactPerson: '',
    website: ''
  });

  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [emailInfo, setEmailInfo] = useState({
    currentEmail: userInfo?.email || '',
    newEmail: '',
    confirmEmail: '',
    currentPassword: '' // Added for email update
  });

  useEffect(() => {
    if (userInfo?.shopInfo) {
      setBusinessInfo(userInfo.shopInfo);
    }
  }, [userInfo]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
  }, [successMessage, errorMessage, dispatch]);

  const add_image = (e) => {
    if (e.target.files.length > 0) {
      const formData = new FormData();
      formData.append('image', e.target.files[0]);
      dispatch(profile_image_upload(formData));
    }
  };

  const handleBusinessInput = (e) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setBusinessInfo(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setBusinessInfo(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateBusinessInfo = () => {
    if (!businessInfo.agencyName) {
      toast.error("Agency name is required");
      return false;
    }
    if (!businessInfo.taxId) {
      toast.error("Tax ID is required");
      return false;
    }
    if (!businessInfo.businessLicense) {
      toast.error("Business license is required");
      return false;
    }
    if (!businessInfo.address.street) {
      toast.error("Street address is required");
      return false;
    }
    if (!businessInfo.address.city) {
      toast.error("City is required");
      return false;
    }
    if (!businessInfo.address.postalCode) {
      toast.error("Postal code is required");
      return false;
    }
    if (!businessInfo.address.country) {
      toast.error("Country is required");
      return false;
    }
    if (businessInfo.fleetSize < 0) {
      toast.error("Fleet size cannot be negative");
      return false;
    }
    if (businessInfo.yearFounded && (businessInfo.yearFounded < 1900 || businessInfo.yearFounded > new Date().getFullYear())) {
      toast.error(`Year founded must be between 1900 and ${new Date().getFullYear()}`);
      return false;
    }
    return true;
  };

  const submitBusinessInfo = (e) => {
    e.preventDefault();
    if (!validateBusinessInfo()) return;
    dispatch(update_business_info(businessInfo));
    setIsEditing(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePassword = () => {
    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
      toast.error("Passwords don't match");
      return false;
    }
    if (passwordInfo.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }
    return true;
  };

  const submitPasswordChange = (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    dispatch(update_password({
      currentPassword: passwordInfo.currentPassword,
      newPassword: passwordInfo.newPassword
    }));
    setPasswordInfo({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInfo.currentPassword) {
      return false;
    }
    if (emailInfo.newEmail !== emailInfo.confirmEmail) {
      toast.error("Emails don't match");
      return false;
    }
    if (!emailRegex.test(emailInfo.newEmail)) {
      toast.error("Invalid email format");
      return false;
    }
    return true;
  };

  const submitEmailChange = (e) => {
    e.preventDefault();
    if (!validateEmail()) return;
    dispatch(update_email({
      currentEmail: userInfo.email,
      newEmail: emailInfo.newEmail,
      currentPassword: emailInfo.currentPassword
    }));
    setEmailInfo(prev => ({
      ...prev,
      newEmail: '',
      confirmEmail: '',
      currentPassword: ''
    }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (userInfo?.shopInfo) {
      setBusinessInfo(userInfo.shopInfo);
    }
  };

  const handleStripeConnect = () => {
    dispatch(create_stripe_connect_account())
      .unwrap()
      .then((response) => {
        toast.success("Redirecting to Stripe...");
        if (response.redirectUrl) {
          window.location.href = response.redirectUrl;
        }
      })
      .catch(error => {
        toast.error(error.message || "Failed to connect with Stripe");
      });
  };

  return (
    <div className="px-4 lg:px-8 py-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Profile Info */}
          <div className="w-full lg:w-2/5 space-y-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 h-24">
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  <div className="relative h-24 w-24 rounded-full border-4 border-white bg-white shadow-lg">
                    {userInfo?.image ? (
                      <label htmlFor="img" className="cursor-pointer">
                        <img 
                          className="w-full h-full rounded-full object-cover" 
                          src={userInfo.image} 
                          alt="Profile" 
                        />
                        {imageLoading && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <FadeLoader color="#ffffff" />
                          </div>
                        )}
                      </label>
                    ) : (
                      <label className="flex items-center justify-center h-full w-full rounded-full bg-gray-200 cursor-pointer" htmlFor="img">
                        <BsImages className="text-3xl text-gray-500" />
                        {imageLoading && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <FadeLoader color="#ffffff" />
                          </div>
                        )}
                      </label>
                    )}
                    <input onChange={add_image} type="file" className="hidden" id="img" accept="image/*" />
                  </div>
                </div>
              </div>
              <div className="pt-16 pb-6 px-6 text-center">
                <h2 className="text-xl font-bold text-gray-800">{userInfo?.name || 'User'}</h2>
                <p className="text-gray-600">{userInfo?.email || 'N/A'}</p>
                <div className="mt-4 flex justify-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    userInfo?.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {userInfo?.status || 'Unknown'}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {userInfo?.role || 'seller'}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="text-gray-600 font-medium">Payment Account</span>
                    </div>
                    {userInfo?.stripeAccountId ? (
                      <div className="flex items-center space-x-2">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Connected
                        </span>
                        <button
                          onClick={() => navigator.clipboard.writeText(userInfo.stripeAccountId)
                            .then(() => toast.success('Stripe ID copied!'))}
                          className="text-xs text-blue-500 hover:text-blue-700 hover:underline"
                          title="Copy Stripe ID"
                        >
                          ID: {userInfo.stripeAccountId.substring(0, 6)}...
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={handleStripeConnect}
                        className={`flex items-center text-xs px-3 py-1 rounded-full transition-all ${
                          stripeLoading 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm'
                        }`}
                        disabled={stripeLoading}
                      >
                        {stripeLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            Connect Stripe
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  {userInfo?.stripeAccountId && (
                    <div className="text-xs pl-6">
                      {userInfo?.stripeAccountStatus === 'complete' ? (
                        <p className="text-green-600 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Payments enabled • Ready to accept payments
                        </p>
                      ) : (
                        <div className="flex items-start">
                          <svg className="w-3 h-3 mt-0.5 mr-1 flex-shrink-0 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="text-yellow-600">
                            Additional verification required • Complete setup in Stripe Dashboard
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subscription</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-1">
                      {userInfo?.subscription?.plan || 'Basic'}
                    </span>
                    {userInfo?.subscription?.isTrial && (
                      <span className="bg-purple-100 text-purple-800 text-xs px-1 rounded ml-1">Trial</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Fleet Size</span>
                  <div className="flex items-center">
                    <FaCar className="text-blue-500 mr-1 text-sm" />
                    <span className="text-sm font-medium">
                      {userInfo?.shopInfo?.fleetSize || 0} vehicles
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
              <nav className="flex flex-col space-y-2">
                <button
                  onClick={() => setActiveTab('business')}
                  className={`px-4 py-2 text-left rounded-md flex items-center ${activeTab === 'business' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <BsBuildings className="mr-2" />
                  Business Info
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`px-4 py-2 text-left rounded-md flex items-center ${activeTab === 'password' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <FaLock className="mr-2" />
                  Change Password
                </button>
                <button
                  onClick={() => setActiveTab('email')}
                  className={`px-4 py-2 text-left rounded-md flex items-center ${activeTab === 'email' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <FaEnvelope className="mr-2" />
                  Change Email
                </button>
              </nav>
            </div>
          </div>
          {/* Right Column - Content Area */}
          <div className="w-full lg:w-3/5 space-y-6">
            {activeTab === 'business' && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <BsBuildings className="mr-2 text-blue-500" />
                    Business Information
                  </h3>
                  {!isEditing && userInfo?.shopInfo && (
                    <button 
                      onClick={handleEditClick}
                      className="flex items-center text-sm text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <FaEdit className="mr-1" />
                      Edit
                    </button>
                  )}
                </div>
                {!userInfo?.shopInfo || isEditing ? (
                  <form onSubmit={submitBusinessInfo} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Agency Name *</label>
                        <input
                          value={businessInfo.agencyName}
                          onChange={handleBusinessInput}
                          className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${businessInfo.agencyName ? 'border-gray-300' : 'border-red-500'}`}
                          type="text"
                          name="agencyName"
                          required
                          placeholder="Enter agency name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID *</label>
                        <input
                          value={businessInfo.taxId}
                          onChange={handleBusinessInput}
                          className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${businessInfo.taxId ? 'border-gray-300' : 'border-red-500'}`}
                          type="text"
                          name="taxId"
                          required
                          placeholder="Enter tax identification number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business License *</label>
                        <input
                          value={businessInfo.businessLicense}
                          onChange={handleBusinessInput}
                          className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${businessInfo.businessLicense ? 'border-gray-300' : 'border-red-500'}`}
                          type="text"
                          name="businessLicense"
                          required
                          placeholder="Enter business license number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year Founded</label>
                        <input
                          value={businessInfo.yearFounded}
                          onChange={handleBusinessInput}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          type="number"
                          name="yearFounded"
                          placeholder="YYYY"
                          min="1900"
                          max={new Date().getFullYear()}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Street</label>
                            <input
                              value={businessInfo.address.street}
                              onChange={handleBusinessInput}
                              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${businessInfo.address.street ? 'border-gray-300' : 'border-red-500'}`}
                              type="text"
                              name="address.street"
                              required
                              placeholder="Street address"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">City</label>
                            <input
                              value={businessInfo.address.city}
                              onChange={handleBusinessInput}
                              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${businessInfo.address.city ? 'border-gray-300' : 'border-red-500'}`}
                              type="text"
                              name="address.city"
                              required
                              placeholder="City"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Postal Code</label>
                            <input
                              value={businessInfo.address.postalCode}
                              onChange={handleBusinessInput}
                              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${businessInfo.address.postalCode ? 'border-gray-300' : 'border-red-500'}`}
                              type="text"
                              name="address.postalCode"
                              required
                              placeholder="Postal code"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Country</label>
                            <input
                              value={businessInfo.address.country}
                              onChange={handleBusinessInput}
                              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${businessInfo.address.country ? 'border-gray-300' : 'border-red-500'}`}
                              type="text"
                              name="address.country"
                              required
                              placeholder="Country"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={businessInfo.description}
                          onChange={handleBusinessInput}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          rows="3"
                          name="description"
                          placeholder="Brief description of your business"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fleet Size</label>
                        <input
                          value={businessInfo.fleetSize}
                          onChange={handleBusinessInput}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          type="number"
                          name="fleetSize"
                          min="0"
                          placeholder="Number of vehicles"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                        <input
                          value={businessInfo.contactPerson}
                          onChange={handleBusinessInput}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          type="text"
                          name="contactPerson"
                          placeholder="Primary contact name"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                            https://
                          </span>
                          <input
                            value={businessInfo.website}
                            onChange={handleBusinessInput}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            type="text"
                            name="website"
                            placeholder="yourwebsite.com"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={businessLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center transition-colors min-w-[120px]"
                      >
                        {businessLoading ? (
                          <PropagateLoader color="#ffffff" cssOverride={overrideStyle} size={10} />
                        ) : userInfo?.shopInfo ? (
                          'Update Profile'
                        ) : (
                          'Save Profile'
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500">Agency Name</p>
                        <p className="font-medium">{userInfo.shopInfo.agencyName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tax ID</p>
                        <p className="font-medium">{userInfo.shopInfo.taxId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Business License</p>
                        <p className="font-medium">{userInfo.shopInfo.businessLicense}</p>
                      </div>
                      {userInfo.shopInfo.yearFounded && (
                        <div>
                          <p className="text-sm text-gray-500">Year Founded</p>
                          <p className="font-medium">{userInfo.shopInfo.yearFounded}</p>
                        </div>
                      )}
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">Address</p>
                        <div className="flex items-start mt-1">
                          <BsGeoAlt className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-medium">{userInfo.shopInfo.address.street}</p>
                            <p className="text-gray-600">
                              {userInfo.shopInfo.address.city}, {userInfo.shopInfo.address.postalCode}
                            </p>
                            <p className="text-gray-600">{userInfo.shopInfo.address.country}</p>
                          </div>
                        </div>
                      </div>
                      {userInfo.shopInfo.description && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500">Description</p>
                          <p className="font-medium whitespace-pre-line">{userInfo.shopInfo.description}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">Fleet Size</p>
                        <div className="flex items-center">
                          <FaCar className="text-blue-500 mr-2" />
                          <p className="font-medium">{userInfo.shopInfo.fleetSize} vehicles</p>
                        </div>
                      </div>
                      {userInfo.shopInfo.contactPerson && (
                        <div>
                          <p className="text-sm text-gray-500">Contact Person</p>
                          <p className="font-medium">{userInfo.shopInfo.contactPerson}</p>
                        </div>
                      )}
                      {userInfo.shopInfo.website && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500">Website</p>
                          <a 
                            href={userInfo.shopInfo.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-blue-500 hover:underline flex items-center"
                          >
                            <BsGlobe className="mr-1" />
                            {userInfo.shopInfo.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'password' && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaLock className="mr-2 text-blue-500" />
                    Change Password
                  </h3>
                </div>
                <form onSubmit={submitPasswordChange} className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
                      <input
                        value={passwordInfo.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        type="password"
                        name="currentPassword"
                        required
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                      <input
                        value={passwordInfo.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        type="password"
                        name="newPassword"
                        required
                        minLength="8"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password *</label>
                      <input
                        value={passwordInfo.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        type="password"
                        name="confirmPassword"
                        required
                        minLength="8"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={passwordLoading || !passwordInfo.currentPassword || !passwordInfo.newPassword || !passwordInfo.confirmPassword}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center transition-colors w-full"
                    >
                      {passwordLoading ? (
                        <PropagateLoader color="#ffffff" cssOverride={overrideStyle} size={10} />
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
            {activeTab === 'email' && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaEnvelope className="mr-2 text-blue-500" />
                    Change Email Address
                  </h3>
                </div>
                <form onSubmit={submitEmailChange} className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Email</label>
                      <input
                        value={userInfo?.email || ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                        type="email"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
                      <input
                        value={emailInfo.currentPassword}
                        onChange={handleEmailChange}
                        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${emailInfo.currentPassword ? 'border-gray-300' : 'border-red-500'}`}
                        type="password"
                        name="currentPassword"
                        required
                        placeholder="Enter current password"
                      />
                      {!emailInfo.currentPassword && (
                       <p> </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Email *</label>
                      <input
                        value={emailInfo.newEmail}
                        onChange={handleEmailChange}
                        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          emailInfo.newEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInfo.newEmail) 
                            ? 'border-red-500' 
                            : 'border-gray-300'
                        }`}
                        type="email"
                        name="newEmail"
                        required
                        placeholder="Enter new email"
                      />
                      {emailInfo.newEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInfo.newEmail) && (
                        <p className="mt-1 text-sm text-red-600">Please enter a valid email address</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Email *</label>
                      <input
                        value={emailInfo.confirmEmail}
                        onChange={handleEmailChange}
                        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          emailInfo.confirmEmail && emailInfo.newEmail !== emailInfo.confirmEmail 
                            ? 'border-red-500' 
                            : 'border-gray-300'
                        }`}
                        type="email"
                        name="confirmEmail"
                        required
                        placeholder="Confirm new email"
                      />
                      {emailInfo.confirmEmail && emailInfo.newEmail !== emailInfo.confirmEmail && (
                        <p className="mt-1 text-sm text-red-600">Emails don't match</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={emailLoading || !emailInfo.newEmail || !emailInfo.confirmEmail || emailInfo.newEmail !== emailInfo.confirmEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInfo.newEmail) || !emailInfo.currentPassword}
                      className={`px-4 py-2 rounded-md flex items-center justify-center transition-colors w-full ${
                        emailLoading || !emailInfo.newEmail || !emailInfo.confirmEmail || emailInfo.newEmail !== emailInfo.confirmEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInfo.newEmail) || !emailInfo.currentPassword
                          ? 'bg-blue-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                    >
                      {emailLoading ? (
                        <PropagateLoader color="#ffffff" cssOverride={overrideStyle} size={10} />
                      ) : (
                        'Update Email'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaMoneyBillWave className="mr-2 text-green-500" />
                Subscription Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Plan</p>
                  <p className="font-medium">{userInfo?.subscription?.plan || 'Basic'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`font-medium capitalize ${
                    userInfo?.subscription?.status === 'active' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {userInfo?.subscription?.status || 'active'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Car Limit</p>
                  <p className="font-medium">{userInfo?.subscription?.carLimit || 2} vehicles</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trial</p>
                  <p className={`font-medium ${
                    userInfo?.subscription?.isTrial ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {userInfo?.subscription?.isTrial ? 'Active' : 'Inactive'}
                  </p>
                </div>
                {userInfo?.subscription?.startDate && (
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium flex items-center">
                      <BsCalendar className="mr-1 text-blue-500" />
                      {new Date(userInfo.subscription.startDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {userInfo?.subscription?.endDate && (
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium flex items-center">
                      <BsCalendar className="mr-1 text-blue-500" />
                      {new Date(userInfo.subscription.endDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
