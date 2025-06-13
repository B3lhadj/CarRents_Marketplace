import React, { useEffect, useState } from 'react';
import {
  BsCurrencyDollar,
  BsCarFrontFill,
  BsGraphUp,
  BsGraphDown,
  BsFilter,
  BsArrowUpShort,
  BsArrowDownShort,
  BsClockHistory,
} from 'react-icons/bs';
import { FaUsers, FaCarAlt, FaRegCalendarAlt, FaPlus, FaSearch, FaEllipsisV, FaMoneyBillWave } from 'react-icons/fa';
import { RiCarWashingLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import Chart from 'react-apexcharts';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { get_admin_dashboard_index_data } from '../../store/Reducers/dashboardIndexReducer';
import { motion } from 'framer-motion';
import { Tooltip } from 'react-tooltip';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const {
    userInfo,
    totalSale,
    totalOrder,
    totalProduct,
    totalSeller,
    recentOrders,
    recentMessage,
    stripeData,
    loader,
    errorMessage,
  } = useSelector((state) => state.dashboardIndex);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('30d');
  const [chartData, setChartData] = useState({
    options: {},
    series: [],
  });

  useEffect(() => {
    dispatch(get_admin_dashboard_index_data({ days: timeRange === '7d' ? 7 : 30 }));
  }, [dispatch, timeRange]);

  useEffect(() => {
    // Prepare chart data when stripeData changes
    const prepareChartData = () => {
      const dates = stripeData.revenueByDay?.map((item) => moment(item.date).format('MMM D')) || [];
      const amounts = stripeData.revenueByDay?.map((item) => item.amount / 100) || []; // Convert cents to dollars

      setChartData({
        options: {
          colors: ['#6366f1'],
          chart: {
            type: 'area',
            height: 400,
            background: 'transparent',
            foreColor: '#6b7280',
            toolbar: {
              show: true,
              tools: {
                download: true,
                selection: true,
                zoom: true,
                zoomin: true,
                zoomout: true,
                pan: true,
                reset: true,
              },
            },
            animations: {
              enabled: true,
              easing: 'easeinout',
              speed: 800,
            },
          },
          dataLabels: { enabled: false },
          stroke: { curve: 'smooth', width: 2.5 },
          fill: {
            type: 'gradient',
            gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.2, stops: [0, 90, 100] },
          },
          xaxis: {
            categories: dates,
            axisBorder: { show: true, color: '#e5e7eb' },
          },
          yaxis: {
            labels: {
              formatter: (val) => `$${val.toFixed(2)}`,
              style: {
                colors: ['#6b7280'],
                fontSize: '12px',
              },
            },
          },
          tooltip: {
            enabled: true,
            y: {
              formatter: (val) => `$${val.toFixed(2)}`,
            },
          },
        },
        series: [{ name: 'Revenue ($)', data: amounts }],
      });
    };

    prepareChartData();
  }, [stripeData]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedOrders = [...recentOrders].sort((a, b) => {
    if (!sortConfig.key) return 0;

    if (sortConfig.key === 'startDate') {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
    }

    if (sortConfig.key === 'price') {
      return sortConfig.direction === 'ascending' ? a.price - b.price : b.price - a.price;
    }

    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const filteredOrders = sortedOrders.filter((order) => {
    const matchesFilter = activeFilter === 'all' || order.payment_status.toLowerCase() === activeFilter;
    const matchesSearch =
      order.carModel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order._id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Car Rental Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, <span className="font-medium text-indigo-600">{userInfo?.name || 'Admin'}</span>
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }}>
          <Link
            to="/admin/add-car"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg shadow-md transition-all"
          >
            <FaPlus className="text-sm" />
            <span>Add New Car</span>
          </Link>
        </motion.div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{errorMessage}</div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all p-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-800">
                ${(stripeData.totalRevenue / 100 || 0).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
              <div className="mt-2">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Pending: </span>
                  ${(stripeData.pending / 100 || 0).toFixed(2)}
                </p>
              </div>
              <Link
                to="/admin/dashboard/transactions"
                className="text-xs text-indigo-600 hover:text-indigo-800 mt-2 inline-block flex items-center gap-1"
              >
                <BsClockHistory className="text-sm" /> View transaction history
              </Link>
            </div>
            <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
              <FaMoneyBillWave className="text-xl" />
            </div>
          </div>
        </motion.div>

        {/* Total Cars */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all p-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Available Cars</p>
              <h3 className="text-2xl font-bold text-gray-800">{totalProduct?.toLocaleString() || 0}</h3>
              <div className="flex items-center mt-2">
                <span className="text-xs text-gray-500">Across all categories</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <FaCarAlt className="text-xl" />
            </div>
          </div>
        </motion.div>

        {/* Total Sellers */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all p-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Active Sellers</p>
              <h3 className="text-2xl font-bold text-gray-800">{totalSeller?.toLocaleString() || 0}</h3>
              <div className="flex items-center mt-2">
                <span className="text-xs text-gray-500">Verified partners</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <FaUsers className="text-xl" />
            </div>
          </div>
        </motion.div>

        {/* Total Bookings */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all p-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Bookings</p>
              <h3 className="text-2xl font-bold text-gray-800">{totalOrder?.toLocaleString() || 0}</h3>
              <div className="flex items-center mt-2">
                <span className="text-xs text-gray-500">{recentOrders.length} recent</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
              <RiCarWashingLine className="text-xl" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-lg font-semibold text-gray-800">Revenue Overview</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-3 py-1 text-xs rounded-full transition ${
                  timeRange === '7d' ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-3 py-1 text-xs rounded-full transition ${
                  timeRange === '30d' ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                }`}
              >
                Last 30 Days
              </button>
            </div>
          </div>
          {chartData.series[0]?.data?.length > 0 ? (
            <Chart options={chartData.options} series={chartData.series} type="area" height={400} />
          ) : (
            <div className="h-[400px] flex items-center justify-center text-gray-500">
              No revenue data available for this period
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
            <Link
              to="/admin/dashboard/transactions"
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View All <BsArrowUpShort className="rotate-45" />
            </Link>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {stripeData.transactions?.length > 0 ? (
              stripeData.transactions.slice(0, 5).map((txn, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer border border-gray-100"
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        txn.status === 'succeeded' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                      }`}
                    >
                      <BsCurrencyDollar className="text-lg" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {txn.billing_details?.name || 'Card Payment'}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                        ${(txn.amount / 100).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">
                        {moment(txn.created * 1000).format('MMM D, h:mm A')}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          txn.status === 'succeeded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {txn.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No recent transactions found</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Bookings</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-grow sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <BsFilter className="text-gray-500" />
                <select
                  className="text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { key: '_id', label: 'Booking ID' },
                    { key: 'carModel', label: 'Car Model' },
                    { key: 'price', label: 'Amount' },
                    { key: 'payment_status', label: 'Status' },
                    { key: 'startDate', label: 'Rental Dates' },
                    { key: null, label: 'Actions' },
                  ].map((column, index) => (
                    <th
                      key={index}
                      scope="col"
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        column.key ? 'cursor-pointer hover:bg-gray-100' : ''
                      }`}
                      onClick={() => column.key && requestSort(column.key)}
                    >
                      <div className="flex items-center gap-1">
                        {column.label}
                        {column.key && (
                          <>
                            {sortConfig.key === column.key && sortConfig.direction === 'ascending' && (
                              <BsArrowUpShort className="text-gray-400" />
                            )}
                            {sortConfig.key === column.key && sortConfig.direction === 'descending' && (
                              <BsArrowDownShort className="text-gray-400" />
                            )}
                          </>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <span
                          data-tooltip-id="booking-tooltip"
                          data-tooltip-content={`Created: ${moment(order.createdAt).format('MMM D, YYYY h:mm A')}`}
                          className="hover:underline cursor-help"
                        >
                          #{order._id.slice(-6)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <BsCarFrontFill className="text-indigo-500" />
                          {order.carModel || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          data-tooltip-id="status-tooltip"
                          data-tooltip-content={`Last updated: ${moment(order.updatedAt).format('MMM D, YYYY h:mm A')}`}
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            order.payment_status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : order.payment_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {order.payment_status}
                        </span>
                        <Tooltip id="status-tooltip" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FaRegCalendarAlt className="text-gray-400" />
                          {moment(order.startDate).format('MMM D')} - {moment(order.endDate).format('MMM D')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/admin/dashboard/order/details/${order._id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </Link>
                          <button className="text-gray-400 hover:text-gray-600">
                            <FaEllipsisV />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No bookings found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <Tooltip id="booking-tooltip" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;