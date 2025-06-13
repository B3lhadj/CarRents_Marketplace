import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchSellerBookings, 
  getBookingStatus,
  acceptSellerBooking,
  cancelSellerBooking,
  clearSellerBookingError
} from '../../store/Reducers/bookingReducer';
import { 
  FaCar, 
  FaUser, 
  FaCalendarAlt, 
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaChevronLeft,
  FaInfoCircle,
  FaFilter
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import './SellerBookings.css';

const statusColors = {
  paid: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-purple-100 text-purple-800',
};

const statusIcons = {
  paid: <FaMoneyBillWave className="mr-1" />,
  accepted: <FaCheckCircle className="mr-1" />,
  cancelled: <FaTimesCircle className="mr-1" />,
  pending: <FaSpinner className="mr-1 animate-spin" />,
  completed: <FaCheckCircle className="mr-1" />,
};

const SellerBookings = () => {
  const dispatch = useDispatch();

  const { 
    sellerBookings = [], 
    bookingDetails = {},
    loading = false, 
    error = null,
    statusUpdateLoading = false,
    pagination = {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
    },
  } = useSelector((state) => {
    console.log('Redux State:', state);
    return state.booking || {};
  });

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    console.log('Fetching bookings for page:', currentPage);
    dispatch(fetchSellerBookings(currentPage));
  }, [dispatch, currentPage]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearSellerBookingError());
    }
    console.log('sellerBookings:', sellerBookings);
  }, [error, dispatch, sellerBookings]);

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      if (status === 'accepted') {
        const result = await dispatch(acceptSellerBooking(bookingId)).unwrap();
        toast.success('Booking accepted! Payment link created.', {
          action: {
            label: 'Open Payment Link',
            onClick: () => window.open(result.paymentUrl, '_blank'),
          },
        });
      } else if (status === 'cancelled') {
        await dispatch(cancelSellerBooking(bookingId)).unwrap();
        toast.success('Booking cancelled successfully');
      } else if (status === 'completed') {
        toast.error('Completing bookings is not supported yet');
        return;
      }
      dispatch(fetchSellerBookings(currentPage));
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const filteredBookings = sellerBookings.filter((booking) => {
    if (statusFilter === 'all') return true;
    return booking.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const dateA = new Date(a.dates?.start || a.createdAt || Date.now());
    const dateB = new Date(b.dates?.start || b.createdAt || Date.now());
    
    if (sortOption === 'newest') return dateB - dateA;
    if (sortOption === 'oldest') return dateA - dateB;
    if (sortOption === 'price-high') return (b.totalPrice || 0) - (a.totalPrice || 0);
    if (sortOption === 'price-low') return (a.totalPrice || 0) - (b.totalPrice || 0);
    return 0;
  });

  console.log('Filtered Bookings:', filteredBookings);
  console.log('Sorted Bookings:', sortedBookings);

  return (
    <div className="seller-bookings-container p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Your Bookings</h1>
        <div className="flex space-x-4">
          <div className="filter-dropdown flex items-center">
            <FaFilter className="mr-2 text-gray-500" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="accepted">Accepted</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="sort-dropdown">
            <select 
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Price (High to Low)</option>
              <option value="price-low">Price (Low to High)</option>
            </select>
          </div>
        </div>
      </div>
      
      {selectedBooking ? (
        <BookingDetails 
          booking={selectedBooking} 
          onBack={() => setSelectedBooking(null)}
          onStatusUpdate={handleStatusUpdate}
          bookingStatus={bookingDetails[selectedBooking._id]}
          loading={statusUpdateLoading}
        />
      ) : (
        <>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-4xl text-blue-500" />
            </div>
          ) : sortedBookings.length === 0 ? (
            <div className="text-center py-10">
              <FaInfoCircle className="mx-auto text-4xl text-gray-400 mb-4" />
              <p className="text-gray-600">
                {sellerBookings.length === 0 
                  ? "No bookings found" 
                  : `No bookings match the "${statusFilter}" filter`}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedBookings.map((booking) => (
                  <BookingCard 
                    key={booking._id}
                    booking={booking}
                    onSelect={() => setSelectedBooking(booking)}
                  />
                ))}
              </div>
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="px-4 py-2 mr-2 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= pagination.totalPages || loading}
                    className="px-4 py-2 ml-2 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

const BookingCard = ({ booking, onSelect }) => {
  return (
    <div 
      className="border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden cursor-pointer"
      onClick={onSelect}
    >
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center">
          <FaCar className="text-gray-500 mr-2" />
          <h3 className="font-semibold truncate">
            {booking.car?.brand || 'Unknown'} {booking.car?.name || 'Car'}
          </h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status.toLowerCase()] || statusColors.pending}`}>
          {statusIcons[booking.status.toLowerCase()] || statusIcons.pending}
          {(booking.status || 'Pending').toUpperCase()}
        </span>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center">
          <FaUser className="text-gray-400 mr-2" />
          <span>{booking.user?.name || 'Unknown User'}</span>
        </div>
        <div className="flex items-center">
          <FaCalendarAlt className="text-gray-400 mr-2" />
          <span>
            {booking.dates?.start ? new Date(booking.dates.start).toLocaleDateString() : 'N/A'} - 
            {booking.dates?.end ? new Date(booking.dates.end).toLocaleDateString() : 'N/A'}
          </span>
        </div>
        <div className="flex items-center">
          <FaMoneyBillWave className="text-gray-400 mr-2" />
          <span>${booking.totalPrice || '0'}</span>
        </div>
      </div>
      <div className="p-4 border-t bg-gray-50">
        <button 
          className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

const BookingDetails = ({ booking, onBack, onStatusUpdate, bookingStatus, loading }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('Fetching status for booking:', booking._id);
    dispatch(getBookingStatus(booking._id));
  }, [dispatch, booking._id]);

  const calculateDuration = () => {
    if (!booking.dates?.start || !booking.dates?.end) return 0;
    const start = new Date(booking.dates.start);
    const end = new Date(booking.dates.end);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    onStatusUpdate(booking._id, newStatus);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <button 
        onClick={onBack}
        className="flex items-center p-4 text-blue-600 hover:text-blue-800 transition-colors"
      >
        <FaChevronLeft className="mr-1" /> Back to all bookings
      </button>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {booking.car?.brand || 'Unknown'} {booking.car?.name || 'Car'} Booking
          </h2>
          <div className="flex items-center space-x-4">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[bookingStatus?.status || booking.status.toLowerCase()] || statusColors.pending}`}>
              {statusIcons[bookingStatus?.status || booking.status.toLowerCase()] || statusIcons.pending}
              {(bookingStatus?.status || booking.status || 'Pending').toUpperCase()}
            </span>
            {(booking.status.toLowerCase() === 'pending' || booking.status.toLowerCase() === 'accepted') && (
              <select 
                value={bookingStatus?.status || booking.status.toLowerCase()}
                onChange={handleStatusChange}
                disabled={loading}
                className="border rounded px-3 py-1"
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="cancelled">Cancelled</option>
                {booking.status.toLowerCase() === 'accepted' && <option value="completed">Completed</option>}
              </select>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-700">
                <FaUser className="mr-2" /> Customer Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{booking.user?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{booking.user?.email || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-700">
                <FaCalendarAlt className="mr-2" /> Booking Dates
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-medium">{booking.dates?.start ? new Date(booking.dates.start).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">End Date:</span>
                  <span className="font-medium">{booking.dates?.end ? new Date(booking.dates.end).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{calculateDuration()} days</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-700">
                <FaMoneyBillWave className="mr-2" /> Payment Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Price:</span>
                  <span className="font-semibold text-lg">${booking.totalPrice || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className="font-medium">{bookingStatus?.paymentStatus || 'Unknown'}</span>
                </div>
                {bookingStatus?.paymentUrl && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Link:</span>
                    <a 
                      href={bookingStatus.paymentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Pay Now
                    </a>
                  </div>
                )}
                {bookingStatus?.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Link Expires:</span>
                    <span className="font-medium">
                      {new Date(bookingStatus.expiresAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-700">
                <FaCar className="mr-2" /> Car Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Car:</span>
                  <span className="font-medium">{booking.car?.brand || 'N/A'} {booking.car?.name || ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per day:</span>
                  <span className="font-medium">${booking.car?.pricePerDay || '0'}</span>
                </div>
              </div>
              <div className="mt-4 rounded-lg overflow-hidden shadow-sm">
                <img 
                  src={booking.car?.images?.[0] || '/placeholder-car.jpg'} 
                  alt={`${booking.car?.brand || 'Car'} ${booking.car?.name || ''}`}
                  className="w-full h-48 object-cover" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-car.jpg';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerBookings;