import React, { useEffect, useState } from 'react';
import { FaEye, FaSearch, FaFilter, FaChevronDown, FaChevronUp, FaSyncAlt, FaUserPlus, FaUsers } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import Pagination from '../Pagination';
import { useDispatch, useSelector } from 'react-redux';
import { get_active_sellers, seller_status_update, messageClear } from '../../store/Reducers/sellerReducer';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Sellers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sellers, totalSeller, successMessage, errorMessage, loader } = useSelector((state) => state.seller);
  const { token } = useSelector((state) => state.auth);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [parPage, setParPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    active: 0,
    pending: 0,
    suspended: 0,
  });
  const [filters, setFilters] = useState({
    status: 'active',
  });
  const [statusUpdates, setStatusUpdates] = useState({});

  // Validate token
  useEffect(() => {
    if (!token) {
      toast.error('No authentication token found. Please log in.');
      navigate('/admin/login');
    }
  }, [token, navigate]);

  // Calculate statistics with fallback for missing status
  useEffect(() => {
    if (sellers.length > 0) {
      const activeCount = sellers.filter((s) => s.status === 'active').length;
      const pendingCount = sellers.filter((s) => s.status === 'pending').length;
      const suspendedCount = sellers.filter((s) => s.status === 'suspended').length;
      setStats({
        active: activeCount,
        pending: pendingCount,
        suspended: suspendedCount,
      });
    } else {
      setStats({ active: 0, pending: 0, suspended: 0 });
    }
  }, [sellers]);

  // Handle messages
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

  // Fetch sellers with debounce
  useEffect(() => {
    if (!token) return;
    const debounceTimer = setTimeout(() => {
      dispatch(
        get_active_sellers({
          parPage: parseInt(parPage),
          page: parseInt(currentPage),
          searchValue,
          ...filters,
        })
      );
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchValue, currentPage, parPage, filters, dispatch, token]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      status: 'active',
    });
    setCurrentPage(1);
  };

  const refreshData = () => {
    dispatch(
      get_active_sellers({
        parPage: parseInt(parPage),
        page: parseInt(currentPage),
        searchValue,
        ...filters,
      })
    );
  };

  const handleStatusChange = (sellerId, value) => {
    setStatusUpdates((prev) => ({
      ...prev,
      [sellerId]: value,
    }));
  };

  const updateSellerStatus = (sellerId) => {
    const newStatus = statusUpdates[sellerId];
    if (newStatus) {
      dispatch(seller_status_update({ sellerId, status: newStatus }));
      setStatusUpdates((prev) => {
        const newState = { ...prev };
        delete newState[sellerId];
        return newState;
      });
    }
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="px-4 lg:px-8 pt-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Seller Management</h1>
              <p className="text-gray-500">Manage and monitor all registered sellers</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/admin/dashboard/seller/create"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <FaUserPlus />
                <span>Add Seller</span>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Sellers</p>
                  <h3 className="text-2xl font-bold text-gray-800">{stats.active}</h3>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FaUsers className="text-xl" />
                </div>
              </div>
            </motion.div>
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Sellers</p>
                  <h3 className="text-2xl font-bold text-gray-800">{stats.pending}</h3>
                </div>
                <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                  <FaUsers className="text-xl" />
                </div>
              </div>
            </motion.div>
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Suspended Sellers</p>
                  <h3 className="text-2xl font-bold text-gray-800">{stats.suspended}</h3>
                </div>
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <FaUsers className="text-xl" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or email..."
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FaFilter className="text-gray-600" />
                <span className="text-gray-700">Filters</span>
                {showFilters ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              <button
                onClick={refreshData}
                className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                title="Refresh"
              >
                <FaSyncAlt className={`text-gray-600 ${loader ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 overflow-hidden"
              >
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Loading State */}
        {loader && (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Results and Table */}
        {!loader && (
          <>
            {/* Results and Pagination Controls */}
            <div className="px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200">
              <div className="text-sm text-gray-600 mb-2 sm:mb-0">
                Showing <span className="font-medium">{(currentPage - 1) * parPage + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * parPage, totalSeller)}</span> of{' '}
                <span className="font-medium">{totalSeller}</span> sellers
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <label className="text-sm text-gray-600 mr-2">Per page:</label>
                  <select
                    onChange={(e) => {
                      setParPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    value={parPage}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>
                {totalSeller > parPage && (
                  <Pagination
                    pageNumber={currentPage}
                    setPageNumber={setCurrentPage}
                    totalItem={totalSeller}
                    parPage={parPage}
                    showItem={5}
                  />
                )}
              </div>
            </div>

            {/* Sellers Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sellers.length > 0 ? (
                    sellers.map((seller, index) => (
                      <tr key={seller._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {(currentPage - 1) * parPage + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                src={seller.image || '/default-avatar.png'}
                                alt={seller.name || 'Seller'}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/default-avatar.png';
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{seller.name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{seller.email || 'N/A'}</div>
                              {seller.createdAt && (
                                <div className="text-xs text-gray-400 mt-1">
                                  Joined: {new Date(seller.createdAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                seller.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : seller.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : seller.status === 'suspended'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {seller.status || 'Unknown'}
                            </span>
                            <select 
                              value={statusUpdates[seller._id] || seller.status || 'active'}
                              onChange={(e) => handleStatusChange(seller._id, e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="active">Active</option>
                              <option value="pending">Pending</option>
                              <option value="suspended">Suspended</option>
                            </select>
                            {statusUpdates[seller._id] && statusUpdates[seller._id] !== (seller.status || 'active') && (
                              <button
                                onClick={() => updateSellerStatus(seller._id)}
                                className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                              >
                                Update
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/admin/dashboard/seller/details/${seller._id}`}
                            className="text-indigo-600 hover:text-indigo-900 mr-3 inline-flex items-center"
                          >
                            <FaEye className="mr-1" /> View
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center">
                        <div className="text-gray-500">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No sellers found</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {searchValue || Object.values(filters).some(Boolean)
                              ? 'Try adjusting your search or filter criteria'
                              : 'There are currently no sellers registered'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Pagination */}
            {totalSeller > parPage && (
              <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium">{(currentPage - 1) * parPage + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * parPage, totalSeller)}</span> of{' '}
                  <span className="font-medium">{totalSeller}</span> sellers
                </div>
                <Pagination
                  pageNumber={currentPage}
                  setPageNumber={setCurrentPage}
                  totalItem={totalSeller}
                  parPage={parPage}
                  showItem={5}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Sellers;