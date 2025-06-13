import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { get_admin_order, admin_order_status_update, messageClear } from '../../store/Reducers/OrderReducer';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const OrderDetails = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { order, errorMessage, successMessage, isLoading } = useSelector((state) => state.order);
  const { token } = useSelector((state) => state.auth);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!token) {
      toast.error('No authentication token found. Please log in.');
      navigate('/admin/login');
      return;
    }
    dispatch(get_admin_order(orderId));
  }, [dispatch, orderId, token, navigate]);

  useEffect(() => {
    if (order && order.status) {
      setStatus(order.status);
    }
  }, [order]);

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

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    dispatch(admin_order_status_update({ orderId, info: { status: newStatus } }));
  };

  if (isLoading) {
    return (
      <div className="px-2 lg:px-7 pt-5">
        <div className="w-full p-4 bg-[#283046] rounded-md text-[#d0d2d6] text-center">
          Loading booking details...
        </div>
      </div>
    );
  }

  if (!order || Object.keys(order).length === 0) {
    return (
      <div className="px-2 lg:px-7 pt-5">
        <div className="w-full p-4 bg-[#283046] rounded-md text-[#d0d2d6] text-center">
          Booking not found
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 lg:px-7 pt-5">
      <div className="w-full p-4 bg-[#283046] rounded-md">
        <div className="flex justify-between items-center p-4">
          <h2 className="text-xl text-[#d0d2d6]">Booking Details #{order._id?.slice(-8).toUpperCase()}</h2>
          <select
            onChange={handleStatusChange}
            value={status}
            className="px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]"
          >
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="p-4">
          <div className="flex gap-2 text-lg text-[#d0d2d6]">
            <h2>#{order._id?.slice(-8).toUpperCase()}</h2>
            <span>{order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}</span>
          </div>
          <div className="flex flex-wrap">
            <div className="w-full lg:w-[50%]">
              <div className="pr-3 text-[#d0d2d6] text-lg">
                <div className="flex flex-col gap-1">
                  <h2 className="pb-2 font-semibold">Booked by: {order.user?.name || 'N/A'}</h2>
                  <p>
                    <span className="text-sm">Email: {order.user?.email || 'N/A'}</span>
                  </p>
                </div>
                <div className="flex flex-col gap-1 mt-4">
                  <h2 className="pb-2 font-semibold">Seller: {order.seller?.name || 'N/A'}</h2>
                  <p>
                    <span className="text-sm">Email: {order.seller?.email || 'N/A'}</span>
                  </p>
                </div>
                <div className="flex justify-start items-center gap-3 mt-4">
                  <h2>Payment Status:</h2>
                  <span className="text-base">{order.paymentStatus || 'N/A'}</span>
                </div>
                <div className="flex justify-start items-center gap-3 mt-2">
                  <h2>Booking Dates:</h2>
                  <span className="text-base">
                    {order.dates?.start && order.dates?.end
                      ? `${format(new Date(order.dates.start), 'MMM dd, yyyy')} - ${format(new Date(order.dates.end), 'MMM dd, yyyy')}`
                      : 'N/A'}
                  </span>
                </div>
                <span className="block mt-2">Total Price: ${order.totalPrice?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            <div className="w-full lg:w-[50%]">
              <div className="pl-3">
                <div className="mt-4 flex flex-col">
                  <h2 className="text-lg font-semibold text-[#d0d2d6] mb-2">Car Details</h2>
                  <div className="flex gap-3 text-md">
                    <img
                      className="w-[80px] h-[80px] object-cover"
                      src={order.car?.images?.[0] || ''}
                      alt={order.car?.name || 'Car'}
                    />
                    <div>
                      <h2>{order.car?.name || 'N/A'}</h2>
                      <p>
                        <span>Brand: </span>
                        <span>{order.car?.brand || 'N/A'}</span>
                      </p>
                      <p>
                        <span>Price per Day: </span>
                        <span>${order.car?.pricePerDay?.toFixed(2) || '0.00'}</span>
                      </p>
                    </div>
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

export default OrderDetails;