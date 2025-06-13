import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiSearch, FiEdit2, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { fetchCars, setSearchQuery } from '../../store/Reducers/carsReducer';

const CarList = () => {
  const dispatch = useDispatch();
  const [localSearch, setLocalSearch] = useState('');
  
  // Enhanced state selection with defaults
  const {
    cars = [],
    loading,
    error,
    pagination = { currentPage: 1, totalPages: 1 },
    searchQuery = ''
  } = useSelector((state) => state.cars || {});

  // Debugging
  useEffect(() => {
    console.log('Component state:', {
      cars,
      loading,
      error,
      pagination,
      searchQuery
    });
  }, [cars, loading, error, pagination, searchQuery]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        dispatch(setSearchQuery(localSearch));
        dispatch(fetchCars({ page: 1, search: localSearch }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, dispatch]);

  // Initial load
  useEffect(() => {
    dispatch(fetchCars({ page: 1 }));
  }, [dispatch]);

  if (loading && !cars.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex items-center">
          <div className="text-red-500 mr-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-red-700">
              {error.message || 'Failed to load vehicles'}
              {error.status && ` (Status: ${error.status})`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Vehicle Inventory</h1>
        <div className="relative mt-4 md:mt-0 w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search vehicles..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
      </div>

      {cars.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <p className="text-gray-500">
            {searchQuery ? 'No matching vehicles found' : 'No vehicles available'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => dispatch(fetchCars({ page: 1 }))}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Day</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cars.map((car) => (
                    <tr key={car._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {car.images?.[0] ? (
                              <img className="h-10 w-10 rounded-md object-cover" src={car.images[0]} alt={car.name} />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                                <span className="text-xs text-gray-500">No Image</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{car.name}</div>
                            <div className="text-sm text-gray-500">{car.brand} • {car.year}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {car.sellerId?.shopInfo?.agencyName || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {car.sellerId?.name || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${car.pricePerDay}
                        {car.discount > 0 && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {car.discount}% off
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          car.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {car.available ? 'Available' : 'Booked'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/admin/dashboard/cars/${car._id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FiEye className="inline mr-1" /> View
                          </Link>
                      
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => dispatch(fetchCars({ page: pagination.currentPage - 1, search: searchQuery }))}
                disabled={pagination.currentPage === 1}
                className={`flex items-center px-4 py-2 rounded-md ${pagination.currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <FiChevronLeft className="mr-1" /> Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => dispatch(fetchCars({ page: pagination.currentPage + 1, search: searchQuery }))}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`flex items-center px-4 py-2 rounded-md ${pagination.currentPage === pagination.totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Next <FiChevronRight className="ml-1" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CarList;