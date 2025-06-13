import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCarById } from '../store/reducers/carReducer';
import { createBooking } from '../store/reducers/bookingReducer';
import {
  Calendar,
  Car,
  Clock,
  User,
  Phone,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Check,
  BadgePercent,
  ShieldCheck,
  MapPin,
  Fuel,
  Gauge,
  CreditCard,
  Star,
  ChevronRight,
  Info,
  HardDrive,
  Palette,
  Building,
  Globe,
  FileText,
  Shield,
  X
} from 'lucide-react';

// Popup Message Component (for form validation errors and info)
const PopupMessage = ({ type, message, onClose }) => {
  const bgColor = {
    success: 'bg-green-50 border-green-500',
    error: 'bg-red-50 border-red-500',
    info: 'bg-blue-50 border-blue-500'
  };

  const textColor = {
    success: 'text-green-700',
    error: 'text-red-700',
    info: 'text-blue-700'
  };

  const iconColor = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-blue-500'
  };

  const Icon = {
    success: Check,
    error: AlertCircle,
    info: Info
  }[type];

  return (
    <div className={`fixed top-4 right-4 z-50 border-l-4 ${bgColor[type]} p-4 rounded-lg shadow-lg max-w-md w-full transition-all duration-300 transform translate-x-0`}>
      <div className="flex items-start">
        <Icon className={`h-5 w-5 mt-0.5 mr-2 flex-shrink-0 ${iconColor[type]}`} />
        <div className="flex-1">
          <p className={`text-sm ${textColor[type]}`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-2 text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

// Top-up Style Confirmation Message Component (Green for Success)
const TopUpStyleMessage = ({ message, onClose, navigate }) => (
  <div className="top-up-message bg-green-600 text-white p-6 rounded-lg shadow-lg mb-6 mx-auto max-w-lg text-center relative animate-pulse">
    <button
      onClick={onClose}
      className="absolute top-2 right-2 text-white hover:text-gray-200 focus:outline-none"
      aria-label="Fermer le message"
    >
      <X className="h-5 w-5" />
    </button>
    <h3 className="text-lg font-semibold mb-2">Booking Confirmed!</h3>
    <p className="text-sm mb-4">{message}</p>
    <button
      onClick={() => navigate('/dashboard/my-orders')}
      className="inline-block px-4 py-2 bg-white text-green-600 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
    >
      View My Bookings
    </button>
  </div>
);

// Top-up Style Rejection Message Component (Red for Failure)
const RejectStyleMessage = ({ message, onClose }) => (
  <div className="top-up-message bg-red-600 text-white p-6 rounded-lg shadow-lg mb-6 mx-auto max-w-lg text-center relative animate-pulse">
    <button
      onClick={onClose}
      className="absolute top-2 right-2 text-white hover:text-gray-200 focus:outline-none"
      aria-label="Fermer le message"
    >
      <X className="h-5 w-5" />
    </button>
    <h3 className="text-lg font-semibold mb-2">Booking Failed</h3>
    <p className="text-sm mb-4">{message}</p>
    <button
      onClick={onClose}
      className="inline-block px-4 py-2 bg-white text-red-600 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
    >
      Try Again
    </button>
  </div>
);

const CarBooking = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const carState = useSelector((state) => state.cars) || {};
  const { car = {}, loading = false, error = null } = carState;

  const authState = useSelector((state) => state.auth) || {};
  const { token } = authState;

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [formError, setFormError] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('info');
  const [showConfirmMessage, setShowConfirmMessage] = useState(false); // State for confirmation message
  const [showRejectMessage, setShowRejectMessage] = useState(false); // State for rejection message
  const [rejectMessage, setRejectMessage] = useState(''); // State for rejection message text

  useEffect(() => {
    dispatch(fetchCarById(id));
  }, [dispatch, id]);

  const showMessage = (message, type = 'info', duration = 5000) => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    
    if (duration > 0) {
      setTimeout(() => {
        setShowPopup(false);
      }, duration);
    }
  };

  const calculateTotalPrice = () => {
    if (!startDate || !endDate || !car.pricePerDay) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const total = days * (car.pricePerDay || 0);
    const discount = car.discount || 0;
    return total - (total * discount) / 100;
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    if (!startDate || !endDate || !driverName || !driverPhone) {
      setFormError('All fields are required');
      showMessage('All fields are required', 'error');
      setIsSubmitting(false);
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setFormError('End date must be after start date');
      showMessage('End date must be after start date', 'error');
      setIsSubmitting(false);
      return;
    }

    const bookingData = {
      carId: id,
      startDate,
      endDate,
      driverName,
      driverPhone,
      totalPrice: calculateTotalPrice(),
    };

    dispatch(createBooking(bookingData))
      .unwrap()
      .then(() => {
        setShowConfirmMessage(true); // Show green confirmation message
        setTimeout(() => {
          setShowConfirmMessage(false);
          navigate('/dashboard/my-orders');
        }, 5000); // Auto-dismiss after 5 seconds
      })
      .catch((err) => {
        setFormError(err.message || 'Failed to create booking');
        setRejectMessage(err.message || 'Failed to create booking');
        setShowRejectMessage(true); // Show red rejection message
        setTimeout(() => {
          setShowRejectMessage(false);
        }, 5000); // Auto-dismiss after 5 seconds
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          <p className="mt-4 text-gray-600">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-lg font-medium text-red-800">Error loading car</h3>
          </div>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!car || Object.keys(car).length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <div className="bg-white p-8 rounded-xl shadow-md">
          <h3 className="text-xl font-medium text-gray-900">Car not found</h3>
          <p className="mt-2 text-gray-600">The car you're looking for doesn't exist or may have been removed.</p>
          <button
            onClick={() => navigate('/cars')}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Browse Available Cars
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8 relative">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

          body {
            font-family: 'Inter', sans-serif;
          }

          .top-up-message {
            animation: fadeIn 0.5s ease-in-out;
            z-index: 10;
          }

          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>

      {showPopup && (
        <PopupMessage 
          type={popupType} 
          message={popupMessage} 
          onClose={() => setShowPopup(false)} 
        />
      )}

      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to car listing
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Car Details Section */}
          <div>
            {showConfirmMessage && (
              <TopUpStyleMessage
                message="Your booking has been confirmed successfully!"
                onClose={() => setShowConfirmMessage(false)}
                navigate={navigate}
              />
            )}
            {showRejectMessage && (
              <RejectStyleMessage
                message={rejectMessage}
                onClose={() => setShowRejectMessage(false)}
              />
            )}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="relative h-64 sm:h-80">
                <img
                  src={car.images?.[0] || '/default-car.jpg'}
                  alt={car.name}
                  className="w-full h-full object-cover"
                />
                {car.discount > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center shadow-lg">
                    <BadgePercent className="h-4 w-4 mr-1" />
                    {car.discount}% OFF
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {car.brand} {car.name}
                    </h1>
                    <p className="text-gray-500 mt-1">{car.category} • {car.transmission}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      ${car.pricePerDay}<span className="text-sm font-normal text-gray-500">/day</span>
                    </p>
                    <p className="text-sm text-gray-500">{car.stock} available</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Car className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{car.seats} Seats</span>
                  </div>
                  <div className="flex items-center">
                    <Fuel className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{car.fuelType}</span>
                  </div>
                  <div className="flex items-center">
                    <Gauge className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{car.mileage.toLocaleString()} km</span>
                  </div>
                  <div className="flex items-center">
                    <HardDrive className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{car.engine}cc</span>
                  </div>
                  <div className="flex items-center">
                    <Palette className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 capitalize">{car.color}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{car.year}</span>
                  </div>
                </div>

                {car.rating > 0 ? (
                  <div className="mt-4 flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.floor(car.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {car.rating.toFixed(1)} ({car.reviewsCount || 0} reviews)
                    </span>
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-gray-500">No reviews yet</div>
                )}
              </div>
            </div>

            {/* Car Description */}
            {car.description && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">Description</h2>
                </div>
                <div className="p-6">
                  <div 
                    className="prose prose-sm max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{ __html: car.description }}
                  />
                </div>
              </div>
            )}

            {/* Car Features */}
            {car.features && car.features.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">Features</h2>
                </div>
                <div className="p-6">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {car.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Rental Agency Info */}
            {car.sellerId && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">Rental Agency</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-start">
                    {car.sellerId.image && (
                      <img 
                        src={car.sellerId.image} 
                        alt={car.sellerId.name} 
                        className="h-16 w-16 rounded-full object-cover mr-4"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{car.sellerId.shopInfo?.agencyName || car.sellerId.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <Building className="h-4 w-4 inline mr-1" />
                        {car.sellerId.shopInfo?.address.street}, {car.sellerId.shopInfo?.address.city}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <Globe className="h-4 w-4 inline mr-1" />
                        {car.sellerId.shopInfo?.website || 'No website provided'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <FileText className="h-4 w-4 inline mr-1" />
                        Business License: {car.sellerId.shopInfo?.businessLicense}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <Shield className="h-4 w-4 inline mr-1" />
                        Fleet size: {car.sellerId.shopInfo?.fleetSize} vehicles
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rental Terms */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Rental Terms</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <ShieldCheck className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900">Insurance Coverage</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Comprehensive insurance included with $500 deductible. Additional coverage options available.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900">Cancellation Policy</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Free cancellation up to 24 hours before pickup. No refund for late cancellations.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CreditCard className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900">Payment Terms</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        20% deposit required at booking. Balance due at pickup. We accept all major credit cards.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowTerms(!showTerms)}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  {showTerms ? 'Hide full terms' : 'View full rental terms'}
                  <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${showTerms ? 'rotate-90' : ''}`} />
                </button>
                {showTerms && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Full Rental Agreement</h4>
                    <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                      <li>Minimum rental age is 21 years</li>
                      <li>Valid driver's license required at pickup</li>
                      <li>Mileage limit of 200 miles per day</li>
                      <li>No smoking in the vehicle</li>
                      <li>Pets allowed with prior approval</li>
                      <li>Late return fee of $25 per hour</li>
                      <li>Fuel policy: return with same amount</li>
                      <li>Toll fees are responsibility of renter</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Form Section */}
          <div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-6">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-xl font-bold text-gray-900">Complete Your Booking</h2>
                <p className="text-gray-500 mt-1">Fill in your details to reserve this {car.brand} {car.name}</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {formError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      <p className="text-sm text-red-700">{formError}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                        Pick-up Date
                      </div>
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                        Drop-off Date
                      </div>
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="driverName" className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-500 mr-1" />
                      Driver's Full Name
                    </div>
                  </label>
                  <input
                    type="text"
                    id="driverName"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="driverPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-500 mr-1" />
                      Driver's Phone Number
                    </div>
                  </label>
                  <input
                    type="tel"
                    id="driverPhone"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                    required
                  />
                </div>

                {/* Pickup Location */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900">Pickup Location</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {car.sellerId?.shopInfo?.address?.street || '123 Rental Street'}, {car.location}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Open daily from 8:00 AM to 8:00 PM
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Booking Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Daily Rate</span>
                      <span className="text-sm font-medium">${car.pricePerDay?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rental Duration</span>
                      <span className="text-sm font-medium">{calculateDays()} days</span>
                    </div>
                    {car.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Discount ({car.discount}%)</span>
                        <span className="text-sm font-medium text-green-600">
                          -${((car.pricePerDay * calculateDays() * car.discount) / 100).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-base font-medium">Subtotal</span>
                        <span className="text-base font-medium">
                          ${calculateTotalPrice().toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Taxes & Fees</span>
                      <span className="text-sm font-medium">
                        ${(calculateTotalPrice() * 0.12).toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold">Total Amount</span>
                        <span className="text-xl font-bold text-blue-600">
                          ${(calculateTotalPrice() * 1.12).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900">Payment Information</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Your card will be charged a 20% deposit now. The remaining balance will be charged at pickup.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center text-xs text-gray-500 mt-4">
                  <ShieldCheck className="h-4 w-4 text-green-500 mr-1" />
                  <span>Your booking is protected by our cancellation policy</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarBooking;