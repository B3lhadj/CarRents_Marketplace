
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiArrowLeft, 
  FiTrash2, // Changed from FiEdit2 to FiTrash2
  FiPhone, 
  FiMail, 
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast'; // Added for notifications
import { fetchCarById, clearCurrentCar } from '../../store/Reducers/carsReducer';
import { delete_product, messageClear } from '../../store/Reducers/productReducer'; // Added delete_product and messageClear
import moment from 'moment';

const CarDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Added for redirection
  const { currentCar, loading, error } = useSelector(state => state.cars);
  const { userInfo } = useSelector(state => state.auth);
  const { successMessage, errorMessage, loader: deleteLoading } = useSelector(state => state.product); // Added product state

  useEffect(() => {
    dispatch(fetchCarById(id));
    
    return () => {
      dispatch(clearCurrentCar());
    };
  }, [dispatch, id]);

  // Handle deletion success/error
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      navigate('/admin/dashboard/cars'); // Redirect after successful deletion
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
  }, [successMessage, errorMessage, dispatch, navigate]);

  // Handle delete button click with confirmation
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      dispatch(delete_product(id));
    }
  };

  if (loading || deleteLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
        <button 
          onClick={() => dispatch(fetchCarById(id))}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!currentCar) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Car not found</p>
        <Link
          to="/admin/dashboard/cars"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft className="mr-2" /> Back to all vehicles
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-6">
        <Link
          to="/admin/dashboard/cars"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft className="mr-2" /> Back to all vehicles
        </Link>
        <button
          onClick={handleDelete}
          className="flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Delete vehicle"
          disabled={deleteLoading}
        >
          <FiTrash2 className="mr-2" /> Delete Vehicle
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Car Images */}
        <div className="bg-gray-100 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentCar.images?.length > 0 ? (
              currentCar.images.map((image, index) => (
                <div key={index} className="aspect-w-16 aspect-h-9">
                  <img
                    src={image}
                    alt={`${currentCar.name} ${index + 1}`}
                    className="object-cover rounded-lg w-full h-48"
                  />
                </div>
              ))
            ) : (
              <div className="col-span-3 flex items-center justify-center h-48 bg-gray-200 rounded-lg">
                <span className="text-gray-500">No images available</span>
              </div>
            )}
          </div>
        </div>

        {/* Car Details */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="md:w-2/3">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{currentCar.name}</h1>
                  <p className="text-gray-600">{currentCar.brand} • {currentCar.year}</p>
                </div>
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentCar.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {currentCar.available ? (
                      <span className="flex items-center">
                        <FiCheckCircle className="mr-1" /> Available
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <FiXCircle className="mr-1" /> Booked
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center">
                <FiDollarSign className="text-gray-500 mr-1" />
                <span className="text-xl font-semibold text-gray-800">
                  {currentCar.pricePerDay?.toLocaleString() || 'N/A'}
                </span>
                <span className="text-gray-500 ml-1">/ day</span>
                {currentCar.discount > 0 && (
                  <span className="ml-3 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {currentCar.discount}% discount
                  </span>
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Specifications</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-600">Category</span>
                      <span className="font-medium">{currentCar.category || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-600">Transmission</span>
                      <span className="font-medium">{currentCar.transmission || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-600">Fuel Type</span>
                      <span className="font-medium">{currentCar.fuelType || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-600">Mileage</span>
                      <span className="font-medium">
                        {currentCar.mileage ? `${currentCar.mileage.toLocaleString()} km` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-600">Color</span>
                      <span className="font-medium">{currentCar.color || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-600">Seats</span>
                      <span className="font-medium">{currentCar.seats || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Engine</span>
                      <span className="font-medium">{currentCar.engine || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Features</h2>
                  {currentCar.features?.length > 0 ? (
                    <ul className="space-y-2">
                      {currentCar.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No features listed</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Description</h2>
                <div 
                  className="text-gray-700 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentCar.description || '<p>No description provided.</p>' }}
                />
              </div>
            </div>

            {/* Agency Information */}
            <div className="md:w-1/3 md:pl-6 mt-6 md:mt-0">
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Agency Details</h2>
                
                <div className="flex items-center mb-4">
                  {currentCar.sellerId?.image ? (
                    <img
                      src={currentCar.sellerId.image}
                      alt={currentCar.sellerId.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                      {currentCar.sellerId?.name?.charAt(0) || 'A'}
                    </div>
                  )}
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">
                      {currentCar.sellerId?.shopInfo?.agencyName || 'Unnamed Agency'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {currentCar.sellerId?.name || 'Unknown owner'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <FiMail className="mr-2 text-gray-500 flex-shrink-0" />
                    <span className="truncate">{currentCar.sellerId?.email || 'Email not provided'}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FiPhone className="mr-2 text-gray-500 flex-shrink-0" />
                    <span>{currentCar.sellerId?.phone || 'Phone not provided'}</span>
                  </div>
                  <div className="flex items-start text-gray-700">
                    <FiMapPin className="mr-2 text-gray-500 mt-1 flex-shrink-0" />
                    <div>
                      {currentCar.sellerId?.shopInfo?.address ? (
                        <>
                          <p>{currentCar.sellerId.shopInfo.address.street}</p>
                          <p>{currentCar.sellerId.shopInfo.address.city}, {currentCar.sellerId.shopInfo.address.postalCode}</p>
                          <p>{currentCar.sellerId.shopInfo.address.country}</p>
                        </>
                      ) : (
                        <p>Address not provided</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-800 mb-2">Business Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Tax ID</p>
                      <p>{currentCar.sellerId?.shopInfo?.taxId || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">License</p>
                      <p>{currentCar.sellerId?.shopInfo?.businessLicense || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fleet Size</p>
                      <p>{currentCar.sellerId?.shopInfo?.fleetSize || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Since</p>
                      <p>{currentCar.sellerId?.shopInfo?.yearFounded || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-800 mb-2">Vehicle Status</h3>
                  <div className="flex items-center text-sm">
                    <FiClock className="mr-2 text-gray-500" />
                    <span>
                      Created: {moment(currentCar.createdAt).format('MMM D, YYYY')}
                    </span>
                  </div>
                  <div className="flex items-center text-sm mt-1">
                    <FiClock className="mr-2 text-gray-500" />
                    <span>
                      Last updated: {moment(currentCar.updatedAt).format('MMM D, YYYY')}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      currentCar.available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {currentCar.available ? 'Available for rent' : 'Currently unavailable'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;