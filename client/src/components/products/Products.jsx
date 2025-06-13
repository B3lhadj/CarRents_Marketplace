// CarListing.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCars, setFilters, resetFilters, setPage } from '../../store/reducers/carReducer';
import { FaCar, FaStar, FaGasPump, FaCogs, FaFilter, FaSearch, FaTimes } from 'react-icons/fa';
import { RiMoneyDollarCircleLine } from 'react-icons/ri';
import { GiGearStickPattern } from 'react-icons/gi';

const CarListing = () => {
  const dispatch = useDispatch();
  const { 
    cars, 
    loading, 
    error, 
    filters, 
    pagination 
  } = useSelector((state) => state.cars);

  useEffect(() => {
    dispatch(fetchCars({ 
      page: pagination.currentPage, 
      ...filters 
    }));
  }, [dispatch, pagination.currentPage, filters]);

  const handleFilterChange = (e) => {
    const { name, value, checked } = e.target;
    
    if (name === 'carTypes' || name === 'transmission' || name === 'fuelType') {
      let newValues = [...filters[name]];
      if (checked) {
        newValues.push(value);
      } else {
        newValues = newValues.filter(item => item !== value);
      }
      dispatch(setFilters({ [name]: newValues }));
    } else {
      dispatch(setFilters({ [name]: value }));
    }
  };

  const handlePriceChange = (values) => {
    dispatch(setFilters({ 
      priceRange: values 
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchCars({ 
      page: 1, 
      ...filters 
    }));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-1/4 bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <FaFilter className="mr-2" /> Filters
            </h2>
            <button 
              onClick={handleResetFilters}
              className="text-sm text-blue-600 hover:underline flex items-center"
            >
              <FaTimes className="mr-1" /> Reset
            </button>
          </div>

          {/* Price Range Filter */}
          <div className="mb-6">
            <h3 className="font-medium mb-3 flex items-center">
              <RiMoneyDollarCircleLine className="mr-2" /> Price Range
            </h3>
            <input
              type="range"
              min="0"
              max="1000"
              value={filters.priceRange[1]}
              onChange={(e) => handlePriceChange([filters.priceRange[0], e.target.value])}
              className="w-full mb-2"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}</span>
            </div>
          </div>

          {/* Car Type Filter */}
          <div className="mb-6">
            <h3 className="font-medium mb-3 flex items-center">
              <FaCar className="mr-2" /> Car Type
            </h3>
            {['Sedan', 'SUV', 'Truck', 'Van', 'Sports', 'Luxury'].map((type) => (
              <div key={type} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`type-${type}`}
                  name="carTypes"
                  value={type}
                  checked={filters.carTypes.includes(type)}
                  onChange={handleFilterChange}
                  className="mr-2"
                />
                <label htmlFor={`type-${type}`}>{type}</label>
              </div>
            ))}
          </div>

          {/* Rating Filter */}
          <div className="mb-6">
            <h3 className="font-medium mb-3 flex items-center">
              <FaStar className="mr-2" /> Minimum Rating
            </h3>
            <select
              name="minRating"
              value={filters.minRating}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="0">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
              <option value="1">1+ Stars</option>
            </select>
          </div>

          {/* Transmission Filter */}
          <div className="mb-6">
            <h3 className="font-medium mb-3 flex items-center">
              <GiGearStickPattern className="mr-2" /> Transmission
            </h3>
            {['Automatic', 'Manual'].map((trans) => (
              <div key={trans} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`trans-${trans}`}
                  name="transmission"
                  value={trans}
                  checked={filters.transmission.includes(trans)}
                  onChange={handleFilterChange}
                  className="mr-2"
                />
                <label htmlFor={`trans-${trans}`}>{trans}</label>
              </div>
            ))}
          </div>

          {/* Fuel Type Filter */}
          <div className="mb-6">
            <h3 className="font-medium mb-3 flex items-center">
              <FaGasPump className="mr-2" /> Fuel Type
            </h3>
            {['Gasoline', 'Diesel', 'Electric', 'Hybrid'].map((fuel) => (
              <div key={fuel} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`fuel-${fuel}`}
                  name="fuelType"
                  value={fuel}
                  checked={filters.fuelType.includes(fuel)}
                  onChange={handleFilterChange}
                  className="mr-2"
                />
                <label htmlFor={`fuel-${fuel}`}>{fuel}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4">
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <form onSubmit={handleSearch} className="flex">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by car name, brand or agency..."
                  className="pl-10 pr-4 py-2 w-full border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition"
              >
                Search
              </button>
            </form>
          </div>

          {/* Results Count */}
          <div className="mb-4 text-gray-600">
            Showing {cars.length} of {pagination.totalCars} cars
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p>{error}</p>
            </div>
          )}

          {/* Cars Grid */}
          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => (
                  <div key={car._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                    <div className="relative">
                      <img 
                        src={car.images[0] || '/default-car.jpg'} 
                        alt={car.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        ${car.pricePerDay}/day
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold">{car.brand} {car.name}</h3>
                        <div className="flex items-center">
                          <FaStar className="text-yellow-400 mr-1" />
                          <span>{car.rating || 'New'}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <FaCar className="mr-2" />
                        <span>{car.carType}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs flex items-center">
                          <GiGearStickPattern className="mr-1" /> {car.transmission}
                        </span>
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs flex items-center">
                          <FaGasPump className="mr-1" /> {car.fuelType}
                        </span>
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs flex items-center">
                          <FaCogs className="mr-1" /> {car.seats} Seats
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <img 
                          src={car.sellerId?.image || '/default-avatar.jpg'} 
                          alt={car.sellerId?.name}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <span>{car.sellerId?.shopInfo?.agencyName || 'Private Owner'}</span>
                      </div>
                      <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                        Rent Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center space-x-2">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => dispatch(setPage(page))}
                        className={`px-4 py-2 rounded ${pagination.currentPage === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarListing;