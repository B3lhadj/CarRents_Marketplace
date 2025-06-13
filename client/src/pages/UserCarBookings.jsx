import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserBookings, initiatePayment } from '../store/reducers/bookingReducer';
import { FaCar, FaCalendarAlt, FaDollarSign, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const UserCarBookings = () => {
  const dispatch = useDispatch();
  const bookingState = useSelector((state) => state.bookings) || {};
  const { bookings = [], loading, error } = bookingState;

  useEffect(() => {
    dispatch(fetchUserBookings());
  }, [dispatch]);

  const handlePayNow = (bookingId) => {
    dispatch(initiatePayment(bookingId))
      .unwrap()
      .then((response) => {
        // Redirect to payment gateway (e.g., Stripe Checkout URL)
        window.location.href = response.paymentUrl;
      })
      .catch((err) => {
        alert('Failed to initiate payment: ' + (err.message || 'Unknown error'));
      });
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
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <FaCar className="mr-2 text-blue-600" />
        My Car Bookings
      </h2>
      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
          <p className="mt-2 text-sm text-gray-500">
            You haven't made any car bookings yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">
                  {booking.carId.brand} {booking.carId.name}
                </h3>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-gray-500" />
                    <span>
                      {new Date(booking.startDate).toLocaleDateString()} -{' '}
                      {new Date(booking.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FaDollarSign className="mr-2 text-gray-500" />
                    <span>Total: ${booking.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center">
                    {booking.status === 'accepted' ? (
                      <FaCheckCircle className="mr-2 text-green-500" />
                    ) : booking.status === 'declined' ? (
                      <FaTimesCircle className="mr-2 text-red-500" />
                    ) : (
                      <span className="mr-2 text-gray-500">⏳</span>
                    )}
                    <span
                      className={
                        booking.status === 'accepted'
                          ? 'text-green-600'
                          : booking.status === 'declined'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }
                    >
                      Status:{' '}
                      {booking.status === 'declined'
                        ? 'Not Accepted'
                        : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              {booking.status === 'accepted' && (
                <button
                  onClick={() => handlePayNow(booking._id)}
                  className="mt-4 sm:mt-0 py-2 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Pay Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserCarBookings;