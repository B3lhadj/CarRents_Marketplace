import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchCarById } from '../store/reducers/carReducer';
import { add_friend } from '../store/reducers/chatReducer';
import { FaStar, FaCar, FaGasPump, FaCheckCircle, FaTimesCircle, FaDollarSign, FaTachometerAlt, FaUser, FaBuilding, FaPhone, FaEnvelope, FaGlobe, FaMapMarkerAlt, FaArrowLeft, FaComments } from 'react-icons/fa';
import { GiGearStickPattern, GiCalendar } from 'react-icons/gi';
import { MdEventSeat, MdDescription, MdRule, MdStarBorder, MdStarHalf, MdStar } from 'react-icons/md';
import { IoCarSport } from 'react-icons/io5';
import toast from 'react-hot-toast';

const CarDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const carState = useSelector((state) => state.cars) || {};
  const { car, loading, error } = carState;
  const { my_friends } = useSelector(state => state.chat);
  const { userInfo } = useSelector(state => state.auth);

  const [mainImage, setMainImage] = useState('');
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchCarById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (car && car.images && car.images.length > 0) {
      setMainImage(car.images[0]);
    }
  }, [car]);

const handleContactSeller = async () => {
  // Check if user is logged in
  if (!userInfo || !userInfo.id) {
    toast.error('Please login to contact the seller');
    navigate('/login', { state: { from: `/cars/${id}` } });
    return;
  }

  // Check if we have both user ID and seller ID
  if (!userInfo.id) {
    toast.error('Your user information is incomplete. Please log in again.');
    return;
  }

  if (!car?.sellerId?._id) {
    toast.error('Seller information is not available for this car.');
    return;
  }

  // Check if user is trying to contact themselves
  if (userInfo.id === car.sellerId._id) {
    toast.error("You can't contact yourself!");
    return;
  }

  setContactLoading(true);
  try {
    const result = await dispatch(
      add_friend({
        sellerId: car.sellerId._id,
        userId: userInfo.id
      })
    ).unwrap();

    toast.success('Seller added to your contacts!');
    navigate('/dashboard/chat/');
  } catch (error) {
    toast.error(error?.message || 'Failed to contact seller');
  } finally {
    setContactLoading(false);
  }
};

  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const totalStars = 5;

    for (let i = 0; i < totalStars; i++) {
      if (i < fullStars) {
        stars.push(<MdStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<MdStarHalf key={i} className="text-yellow-400" />);
      } else {
        stars.push(<MdStarBorder key={i} className="text-yellow-400" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 max-w-7xl mx-auto">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="text-center py-16 max-w-7xl mx-auto">
        <h3 className="text-lg font-medium text-gray-900">Car not found</h3>
        <p className="mt-2 text-sm text-gray-500">The car you're looking for does not exist.</p>
        <button
          onClick={() => navigate('/cars')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300"
        >
          Back to Cars
        </button>
      </div>
    );
  }

  const isAlreadyFriend = my_friends?.some(f => f.fdId === car.sellerId?._id);

  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <Link 
          to="/cars" 
          className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2" />
          Back to Cars
        </Link>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Car Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{car.make} {car.model} {car.year}</h1>
              <div className="flex items-center mt-2">
                <div className="flex items-center">
                  {renderStarRating(car.rating || 0)}
                  <span className="ml-2 text-gray-600">
                    {car.rating ? car.rating.toFixed(1) : 'No'} rating
                  </span>
                </div>
                <span className="mx-2 text-gray-300">|</span>
                <span className="text-gray-600">
                  <FaMapMarkerAlt className="inline mr-1" />
                  {car.location}
                </span>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="text-3xl font-bold text-blue-600">
                ${car.pricePerDay?.toFixed(2) || '0.00'}<span className="text-lg font-normal text-gray-500"> / day</span>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="relative h-96 bg-gray-200 rounded-xl overflow-hidden">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <IoCarSport className="text-5xl" />
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {car.images?.map((image, index) => (
                <div
                  key={index}
                  className="relative h-44 bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setMainImage(image)}
                >
                  <img
                    src={image}
                    alt={`${car.make} ${car.model} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Car Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <FaCar className="text-blue-500 mr-2" />
                <span className="font-medium">Make</span>
              </div>
              <p className="text-gray-700">{car.make}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <IoCarSport className="text-blue-500 mr-2" />
                <span className="font-medium">Model</span>
              </div>
              <p className="text-gray-700">{car.model}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <GiCalendar className="text-blue-500 mr-2" />
                <span className="font-medium">Year</span>
              </div>
              <p className="text-gray-700">{car.year}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <FaTachometerAlt className="text-blue-500 mr-2" />
                <span className="font-medium">Mileage</span>
              </div>
              <p className="text-gray-700">{car.mileage?.toLocaleString() || 'N/A'} miles</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <GiGearStickPattern className="text-blue-500 mr-2" />
                <span className="font-medium">Transmission</span>
              </div>
              <p className="text-gray-700">{car.transmission || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <FaGasPump className="text-blue-500 mr-2" />
                <span className="font-medium">Fuel Type</span>
              </div>
              <p className="text-gray-700">{car.fuelType || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <MdEventSeat className="text-blue-500 mr-2" />
                <span className="font-medium">Seats</span>
              </div>
              <p className="text-gray-700">{car.seats || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <FaCar className="text-blue-500 mr-2" />
                <span className="font-medium">Type</span>
              </div>
              <p className="text-gray-700">{car.type || 'N/A'}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            <button
              onClick={() => navigate('/checkout', { state: { car } })}
              className="w-full py-3 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <FaDollarSign className="inline mr-2" />
              Rent Now
            </button>

            {/* Contact Seller Button */}
            {userInfo ? (
              <button
                onClick={handleContactSeller}
                disabled={contactLoading || isAlreadyFriend || !car.sellerId?._id}
                className={`w-full py-3 text-sm font-medium text-white rounded-lg shadow-md transition-all duration-300 flex items-center justify-center ${
                  contactLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : isAlreadyFriend
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {contactLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : isAlreadyFriend ? (
                  <>
                    <FaComments className="mr-2" />
                    Message Seller
                  </>
                ) : (
                  <>
                    <FaComments className="mr-2" />
                    Contact Seller
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => navigate('/login', { state: { from: `/cars/${id}` } })}
                className="w-full py-3 text-sm font-medium text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 flex items-center justify-center"
              >
                <FaComments className="mr-2" />
                Login to Contact Seller
              </button>
            )}

            <button
              onClick={() => navigate('/cars')}
              className="w-full py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg shadow-md hover:bg-gray-200 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Back to Listings
            </button>
          </div>

          {/* Seller Information */}
          {car.sellerId && (
            <div className="mt-12 bg-gray-50 rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <FaBuilding className="mr-2 text-blue-600" />
                Rental Agency Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={car.sellerId.image}
                      alt={car.sellerId.shopInfo?.agencyName}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{car.sellerId.shopInfo?.agencyName || 'No Agency Name'}</h3>
                    <p className="text-sm text-gray-500">Est. {car.sellerId.shopInfo?.yearFounded}</p>
                    <p className="text-sm text-gray-500">{car.sellerId.shopInfo?.fleetSize} vehicles in fleet</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-blue-500" />
                    Address
                  </h4>
                  <p className="text-gray-600">
                    {car.sellerId.shopInfo?.address.street}<br />
                    {car.sellerId.shopInfo?.address.city}, {car.sellerId.shopInfo?.address.postalCode}<br />
                    {car.sellerId.shopInfo?.address.country}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <FaUser className="mr-2 text-blue-500" />
                    Contact
                  </h4>
                  <p className="flex items-center text-gray-600">
                    <FaPhone className="mr-2" /> {car.sellerId.phone}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <FaEnvelope className="mr-2" /> {car.sellerId.email}
                  </p>
                  {car.sellerId.shopInfo?.website && (
                    <p className="flex items-center text-blue-600 hover:text-blue-800">
                      <FaGlobe className="mr-2" />
                      <a href={car.sellerId.shopInfo.website} target="_blank" rel="noopener noreferrer">
                        {car.sellerId.shopInfo.website}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="mt-12 space-y-8">
            {/* Description */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <MdDescription className="mr-2 text-blue-600" />
                About This Car
              </h2>
              <div
                className="text-gray-600 leading-relaxed text-justify"
                dangerouslySetInnerHTML={{ __html: car.description || 'No description provided.' }}
              />
            </div>

            {/* Features */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaCheckCircle className="mr-2 text-blue-600" />
                Features
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-600">
                {car.features?.length > 0 ? (
                  car.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg shadow-sm"
                    >
                      <FaCheckCircle className="text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No features listed</li>
                )}
              </ul>
            </div>

            {/* Rental Conditions */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MdRule className="mr-2 text-blue-600" />
                Rental Conditions
              </h3>
              <ul className="space-y-2 text-gray-600">
                {car.rentalConditions?.length > 0 ? (
                  car.rentalConditions.map((condition, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <FaCheckCircle className="text-blue-500" />
                      <span>{condition}</span>
                    </li>
                  ))
                ) : (
                  [
                    'Minimum rental age: 21 years',
                    'Valid driver\'s license required',
                    'No smoking allowed',
                    'Return with a full tank',
                    'Insurance coverage included',
                  ].map((condition, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <FaCheckCircle className="text-blue-500" />
                      <span>{condition}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CarDetails;