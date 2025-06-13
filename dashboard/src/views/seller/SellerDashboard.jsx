import React, { useEffect, useState, useCallback } from 'react';
import { 
  FaCar, 
  FaMoneyBillWave, 
  FaCalendarAlt, 
  FaUsers, 
  FaEnvelope,
  FaChartLine,
  FaTable
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { get_seller_dashboard_index_data, messageClear } from '../../store/Reducers/dashboardseller';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';
import { api_url } from '../../utils/utils';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SellerDashboard = () => {
  const { userInfo, token } = useSelector(state => state.auth);
  const { 
    totalSale,
    totalProduct,
    totalOrder,
    totalPendingOrder,
    loader,
    successMessage,
    errorMessage
  } = useSelector(state => state.dashboardIndex);

  const [bookings, setBookings] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const dispatch = useDispatch();

  const fetchRecentBookings = useCallback(async () => {
    try {
      const response = await axios.get(`${api_url}/api/bookings/seller?page=1&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  }, [token]);

  const processChartData = useCallback(() => {
    setChartLoading(false);
  }, []);

  useEffect(() => {
    dispatch(get_seller_dashboard_index_data());
    if (token) {
      fetchRecentBookings();
    }
    return () => {
      dispatch(messageClear());
    };
  }, [dispatch, token, fetchRecentBookings]);

  useEffect(() => {
    if (bookings.length > 0) {
      processChartData();
    }
  }, [bookings, processChartData, timeRange]);

  // Process bookings data for charts
  const getRevenueData = useCallback(() => {
    const now = new Date();
    let labels, data;
    
    if (timeRange === 'week') {
      // Last 7 days
      labels = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (6 - i));
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      });
      
      data = Array(7).fill(0);
      bookings.forEach(booking => {
        const bookingDate = new Date(booking.dates.start);
        const dayDiff = Math.floor((now - bookingDate) / (1000 * 60 * 60 * 24));
        if (dayDiff >= 0 && dayDiff < 7) {
          data[6 - dayDiff] += booking.totalPrice;
        }
      });
    } else {
      // Last 6 months (default)
      labels = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(now);
        date.setMonth(date.getMonth() - (5 - i));
        return date.toLocaleDateString('en-US', { month: 'short' });
      });
      
      data = Array(6).fill(0);
      bookings.forEach(booking => {
        const bookingDate = new Date(booking.dates.start);
        const monthDiff = (now.getFullYear() - bookingDate.getFullYear()) * 12 + 
                         now.getMonth() - bookingDate.getMonth();
        if (monthDiff >= 0 && monthDiff < 6) {
          data[5 - monthDiff] += booking.totalPrice;
        }
      });
    }

    return {
      labels,
      datasets: [
        {
          label: 'Revenue ($)',
          data,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [bookings, timeRange]);

  const getBookingsData = useCallback(() => {
    const now = new Date();
    let labels, data;
    
    if (timeRange === 'week') {
      // Last 7 days
      labels = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (6 - i));
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      });
      
      data = Array(7).fill(0);
      bookings.forEach(booking => {
        const bookingDate = new Date(booking.dates.start);
        const dayDiff = Math.floor((now - bookingDate) / (1000 * 60 * 60 * 24));
        if (dayDiff >= 0 && dayDiff < 7) {
          data[6 - dayDiff] += 1;
        }
      });
    } else {
      // Last 6 months (default)
      labels = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(now);
        date.setMonth(date.getMonth() - (5 - i));
        return date.toLocaleDateString('en-US', { month: 'short' });
      });
      
      data = Array(6).fill(0);
      bookings.forEach(booking => {
        const bookingDate = new Date(booking.dates.start);
        const monthDiff = (now.getFullYear() - bookingDate.getFullYear()) * 12 + 
                         now.getMonth() - bookingDate.getMonth();
        if (monthDiff >= 0 && monthDiff < 6) {
          data[5 - monthDiff] += 1;
        }
      });
    }

    return {
      labels,
      datasets: [
        {
          label: 'Bookings',
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.1,
        },
      ],
    };
  }, [bookings, timeRange]);

  // Sample messages data
  const messages = [
    { id: 1, sender: 'Customer Support', subject: 'New feature update', date: '2 hours ago', read: false },
    { id: 2, sender: 'Payment System', subject: 'Payment processed', date: '1 day ago', read: true },
    { id: 3, sender: 'Booking Alert', subject: 'New booking received', date: '2 days ago', read: true },
  ];

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Dashboard Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back, {userInfo?.name || 'User'}</p>
      </div>

      {/* Error/Success Messages */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          <p>{errorMessage}</p>
          {errorMessage.includes('Authentication') && (
            <p className="mt-2 text-sm">
              Please ensure you are logged in as a seller. <Link to="/login" className="underline">Log in</Link>
            </p>
          )}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Loading State */}
      {(loader || chartLoading) && (
        <div className="mb-6 text-center text-gray-600">
          Loading dashboard data... Please wait.
        </div>
      )}

      {/* Stats Cards */}
      {!loader && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow p-6 flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600 mr-4">
                <FaMoneyBillWave className="text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  ${(typeof totalSale === 'number' ? totalSale : 0).toFixed(2)}
                </h3>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 flex items-center">
              <div className="p-3 rounded-lg bg-green-100 text-green-600 mr-4">
                <FaCar className="text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Vehicles</p>
                <h3 className="text-2xl font-bold text-gray-800">{totalProduct || 0}</h3>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 flex items-center">
              <div className="p-3 rounded-lg bg-amber-100 text-amber-600 mr-4">
                <FaCalendarAlt className="text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Bookings</p>
                <h3 className="text-2xl font-bold text-gray-800">{totalOrder || 0}</h3>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600 mr-4">
                <FaUsers className="text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Pending Bookings</p>
                <h3 className="text-2xl font-bold text-gray-800">{totalPendingOrder || 0}</h3>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaChartLine className="mr-2 text-blue-500" /> Revenue Overview
                </h2>
                <select 
                  className="text-sm border rounded px-2 py-1"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="month">Last 6 Months</option>
                  <option value="week">Last 7 Days</option>
                </select>
              </div>
              <div className="h-64">
                {bookings.length > 0 ? (
                  <Bar 
                    data={getRevenueData()} 
                    options={{ 
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                      },
                    }} 
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No revenue data available
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaChartLine className="mr-2 text-green-500" /> Bookings Trend
                </h2>
                <select 
                  className="text-sm border rounded px-2 py-1"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="month">Last 6 Months</option>
                  <option value="week">Last 7 Days</option>
                </select>
              </div>
              <div className="h-64">
                {bookings.length > 0 ? (
                  <Line 
                    data={getBookingsData()} 
                    options={{ 
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                      },
                    }} 
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No bookings data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaTable className="mr-2 text-amber-500" /> Recent Bookings
              </h2>
              <Link to="/seller/dashboard/orders" className="text-sm text-blue-500 hover:underline">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.length > 0 ? (
                    bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{booking.user.name}</div>
                          <div className="text-sm text-gray-500">{booking.user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-md" src={booking.car.images[0]} alt={booking.car.name} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{booking.car.brand} {booking.car.name}</div>
                              <div className="text-sm text-gray-500">${booking.car.pricePerDay}/day</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(booking.dates.start)}</div>
                          <div className="text-sm text-gray-500">to {formatDate(booking.dates.end)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${booking.totalPrice}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        No recent bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Messages Section */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaEnvelope className="mr-2 text-purple-500" /> Messages
              </h2>
              <Link to="/messages" className="text-sm text-blue-500 hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${!message.read ? 'border-l-4 border-l-blue-500' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`text-sm font-medium ${!message.read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {message.sender}
                      </h3>
                      <p className={`text-sm ${!message.read ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                        {message.subject}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">{message.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SellerDashboard;