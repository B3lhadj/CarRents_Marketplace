import React, { useState, useEffect } from 'react';
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdPayment, MdLocalShipping } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import Pagination from '../Pagination';
import { useSelector, useDispatch } from 'react-redux';
import { get_admin_orders, admin_order_status_update, messageClear } from '../../store/Reducers/OrderReducer';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const Orders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { totalOrder, myOrders, successMessage, errorMessage, isLoading } = useSelector((state) => state.order);
  const { token } = useSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [parPage, setParPage] = useState(10);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [statusUpdates, setStatusUpdates] = useState({});

  useEffect(() => {
    if (!token) {
      toast.error('No authentication token found. Please log in.');
      navigate('/admin/login');
      return;
    }

    dispatch(get_admin_orders({
      parPage: parseInt(parPage),
      page: parseInt(currentPage),
      searchValue,
    }));
  }, [parPage, currentPage, searchValue, dispatch, token, navigate]);

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

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleStatusChange = (orderId, statusType, value) => {
    setStatusUpdates((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [statusType]: value,
      },
    }));
  };

  const updateOrderStatus = (orderId) => {
    const updates = statusUpdates[orderId];
    if (updates) {
      dispatch(admin_order_status_update({ orderId, info: updates }));
      setStatusUpdates((prev) => {
        const newState = { ...prev };
        delete newState[orderId];
        return newState;
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Booking Management</h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select
              onChange={(e) => setParPage(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 flex-grow"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Loading bookings...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Car
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <MdPayment /> Payment
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <MdLocalShipping /> Status
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(myOrders) && myOrders.length > 0 ? (
                  myOrders.map((order) => (
                    <React.Fragment key={order._id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.user?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.car?.name} ({order.car?.brand})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${order.totalPrice?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <select
                              value={statusUpdates[order._id]?.status || order.status}
                              onChange={(e) => handleStatusChange(order._id, 'status', e.target.value)}
                              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                              <option value="pending">Pending</option>
                              <option value="accepted">Accepted</option>
                              <option value="paid">Paid</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            {(statusUpdates[order._id]?.status && statusUpdates[order._id].status !== order.status) && (
                              <button
                                onClick={() => updateOrderStatus(order._id)}
                                className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                              >
                                Update
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/admin/dashboard/booking/details/${order._id}`} // Updated route to match booking
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => toggleOrder(order._id)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              {expandedOrder === order._id ? <MdKeyboardArrowUp size={20} /> : <MdKeyboardArrowDown size={20} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedOrder === order._id && (
                        <tr>
                          <td colSpan="8" className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Booking Information</h3>
                                <div className="text-sm text-gray-500 space-y-1">
                                  <p><strong>Seller:</strong> {order.seller?.name || 'N/A'} ({order.seller?.email})</p>
                                  <p><strong>Start Date:</strong> {order.dates?.start ? format(new Date(order.dates.start), 'MMM dd, yyyy') : 'N/A'}</p>
                                  <p><strong>End Date:</strong> {order.dates?.end ? format(new Date(order.dates.end), 'MMM dd, yyyy') : 'N/A'}</p>
                                </div>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Car Details</h3>
                                <div className="text-sm text-gray-500 space-y-1">
                                  <p><strong>Name:</strong> {order.car?.name || 'N/A'}</p>
                                  <p><strong>Brand:</strong> {order.car?.brand || 'N/A'}</p>
                                  <p><strong>Price per Day:</strong> ${order.car?.pricePerDay?.toFixed(2) || '0.00'}</p>
                                  <img
                                    src={order.car?.images?.[0] || ''}
                                    alt={order.car?.name || 'Car'}
                                    className="w-32 h-32 object-cover mt-2"
                                  />
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-200 text-sm font-medium text-gray-900">
                                  <div className="flex justify-between">
                                    <span>Total:</span>
                                    <span>${order.totalPrice?.toFixed(2) || '0.00'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && totalOrder > parPage && (
          <div className="mt-6 flex justify-center">
            <Pagination
              pageNumber={currentPage}
              setPageNumber={setCurrentPage}
              totalItem={totalOrder}
              parPage={parPage}
              showItem={4}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;