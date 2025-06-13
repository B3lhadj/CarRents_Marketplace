import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCars, setFilters, resetFilters } from '../store/reducers/carReducer';
import { user_reset } from '../store/reducers/authReducer';
import { reset_count } from '../store/reducers/cardReducer';
import { FaCar, FaStar, FaGasPump, FaTimes, FaSearch, FaSignOutAlt, FaBars, FaMapMarkerAlt } from 'react-icons/fa';
import { GiGearStickPattern } from 'react-icons/gi';
import { RiMoneyDollarCircleLine } from 'react-icons/ri';
import { MdEventSeat } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import api from '../api/api';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

const villes = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'];
const pays = ['France', 'Belgique', 'Suisse', 'Luxembourg', 'Canada', 'Espagne', 'Italie', 'Allemagne'];

const CarListing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const carsState = useSelector((state) => state.cars) || {};
  const {
    cars = [],
    loading = false,
    error = null,
    filters = {
      search: '',
      ville: '',
      pays: '',
      priceRange: [0, 1000],
      carTypes: [],
      minRating: 0,
      transmission: [],
      fuelType: [],
    },
    pagination = {
      currentPage: 1,
      totalPages: 1,
      totalCars: 0,
    },
  } = carsState;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const safePriceRange = Array.isArray(filters.priceRange) && filters.priceRange.length === 2
    ? filters.priceRange
    : [0, 1000];

  const logout = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      try {
        await api.get('/customer/logout');
        localStorage.removeItem('customerToken');
        dispatch(user_reset());
        dispatch(reset_count());
        navigate('/login');
        toast.success('Déconnexion réussie', {
          position: 'top-right',
          duration: 3000,
        });
      } catch (error) {
        console.log(error.response?.data);
        toast.error('Échec de la déconnexion', {
          position: 'top-right',
          duration: 3000,
        });
      }
    }
  };

  useEffect(() => {
    dispatch(fetchCars({
      page: 1,
      search: filters.search,
      ville: filters.ville,
      pays: filters.pays,
      priceRange: safePriceRange,
      carTypes: filters.carTypes,
      minRating: filters.minRating,
      transmission: filters.transmission,
      fuelType: filters.fuelType,
    }));
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchCars({
        page: pagination.currentPage,
        search: filters.search,
        ville: filters.ville,
        pays: filters.pays,
        priceRange: safePriceRange,
        carTypes: filters.carTypes,
        minRating: filters.minRating,
        transmission: filters.transmission,
        fuelType: filters.fuelType,
      }));
    }, 500);
    return () => clearTimeout(timer);
  }, [dispatch, filters, pagination.currentPage, safePriceRange]);

  const handleFilterChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'carTypes' || name === 'transmission' || name === 'fuelType') {
      const currentValues = filters[name] || [];
      let newValues = checked
        ? [...currentValues, value]
        : currentValues.filter(item => item !== value);
      dispatch(setFilters({ [name]: newValues }));
    } else {
      dispatch(setFilters({ [name]: value }));
    }
  };

  const handlePriceChange = (value) => {
    dispatch(setFilters({ priceRange: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchCars({
      page: 1,
      search: filters.search,
      ville: filters.ville,
      pays: filters.pays,
      priceRange: safePriceRange,
      carTypes: filters.carTypes,
      minRating: filters.minRating,
      transmission: filters.transmission,
      fuelType: filters.fuelType,
    }));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  const carTypeOptions = ['Sedan', 'SUV', 'Sports Car', 'Coupe', 'Hatchback', 'Convertible', 'Minivan', 'Pickup Truck', 'Luxury', 'Electric'];

  if (loading && !cars.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

          body {
            font-family: 'Inter', sans-serif;
          }

          .navbar {
            background-color: #2563EB;
            color: #FFFFFF;
            transition: all 0.3s ease;
          }

          .nav-item {
            transition: all 0.3s ease;
          }

          .nav-item:hover {
            background-color: #3B82F6;
            transform: translateY(-2px);
          }

          .card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            animation: fadeIn 0.5s ease-in-out;
          }

          .card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
          }

          .filter-section {
            transition: all 0.3s ease;
          }

          .filter-section.hidden {
            max-height: 0;
            opacity: 0;
            overflow: hidden;
          }

          .search-input {
            transition: all 0.3s ease;
          }

          .search-input:focus {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
          }

          .badge {
            animation: pulse 2s infinite;
          }

          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>

      {/* Navbar */}
      <nav className="navbar fixed top-0 left-0 right-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <img
                  className="h-8 transition-transform duration-300 group-hover:scale-110"
                  src={logo}
                  alt="DriveShare Logo"
                  loading="lazy"
                  onError={(e) => (e.target.src = '/fallback-logo.png')}
                />
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="nav-item px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Tableau de bord
              </Link>
              <Link
                to="/car/listing"
                className="nav-item px-3 py-2 rounded-md text-sm font-medium bg-blue-700"
              >
                Liste des voitures
              </Link>
              <Link
                to="/dashboard/profile"
                className="nav-item px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Profil
              </Link>
              <button
                onClick={logout}
                className="nav-item px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600 flex items-center"
              >
                <FaSignOutAlt className="mr-1" /> Déconnexion
              </button>
            </div>
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white focus:outline-none"
                aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              >
                <FaBars className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden bg-blue-600">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/dashboard"
                className="nav-item block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tableau de bord
              </Link>
              <Link
                to="/car/listing"
                className="nav-item block px-3 py-2 rounded-md text-base font-medium bg-blue-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Liste des voitures
              </Link>
              <Link
                to="/dashboard/profile"
                className="nav-item block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profil
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="nav-item block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-red-600"
              >
                <FaSignOutAlt className="inline mr-1" /> Déconnexion
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="pt-20 pb-8">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Voitures Disponibles</h1>
            <p className="text-sm text-gray-600">
              Affichage de <span className="font-medium">{cars.length}</span> sur{' '}
              <span className="font-medium">{pagination.totalCars || 0}</span> résultats
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <section className="grid grid-cols-1 lg:grid-cols-4 gap-x-8 gap-y-10">
            <div className="lg:col-span-3">
              <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
                <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="relative">
                    <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="search"
                      value={filters.search || ''}
                      onChange={handleFilterChange}
                      placeholder="Rechercher des voitures..."
                      className="search-input w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div className="relative">
                    <select
                      name="ville"
                      value={filters.ville || ''}
                      onChange={handleFilterChange}
                      className="search-input w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      <option value="">Toutes les villes</option>
                      {villes.map((ville) => (
                        <option key={ville} value={ville}>{ville}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="relative">
                    <select
                      name="pays"
                      value={filters.pays || ''}
                      onChange={handleFilterChange}
                      className="search-input w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      <option value="">Tous les pays</option>
                      {pays.map((paysItem) => (
                        <option key={paysItem} value={paysItem}>{paysItem}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="sm:col-span-3 py-2 px-4 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Rechercher
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.length === 0 ? (
                  <div className="col-span-full text-center py-16 bg-white rounded-lg shadow">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune voiture trouvée</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Essayez d'ajuster votre recherche ou vos filtres.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                ) : (
                  cars.map((car) => (
                    <div
                      key={car._id}
                      className="card bg-white rounded-lg shadow-md overflow-hidden"
                    >
                      <div className="relative">
                        <img
                          src={car.images?.[0] || '/default-car.jpg'}
                          alt={car.name}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                        />
                        {car.discount > 0 && (
                          <span className="badge absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            {car.discount}% OFF
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">
                          {car.brand} {car.name}
                        </h3>
                        <div className="flex items-center mt-1">
                          <FaStar className="text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-600">
                            {car.rating || 'Nouveau'}
                          </span>
                        </div>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <FaMapMarkerAlt className="mr-1 text-gray-500" />
                          <span>{car.ville}, {car.pays}</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600 space-y-1">
                          <div className="flex items-center">
                            <FaCar className="mr-2 text-gray-500" />
                            Type: {car.category}
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2 text-gray-500">📅</span>
                            Année: {car.year}
                          </div>
                          <div className="flex items-center">
                            <FaGasPump className="mr-2 text-gray-500" />
                            Carburant: {car.fuelType}
                          </div>
                          <div className="flex items-center">
                            <GiGearStickPattern className="mr-2 text-gray-500" />
                            Transmission: {car.transmission}
                          </div>
                          <div className="flex items-center">
                            <MdEventSeat className="mr-2 text-gray-500" />
                            Sièges: {car.seats}
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2 text-gray-500">📏</span>
                            Kilométrage: {car.mileage} km
                          </div>
                        </div>
                        <div className="mt-3 flex justify-between items-center">
                          <p className="text-lg font-medium text-gray-900">
                            ${car.pricePerDay}/jour
                          </p>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              car.available
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {car.available ? 'Disponible' : 'Réservé'}
                          </span>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <Link
                            to={car.available ? `/car/booking/${car._id}` : '#'}
                            className={`flex-1 py-2 text-sm font-medium text-white rounded-md text-center ${
                              car.available
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-gray-400 cursor-not-allowed'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            onClick={(e) => {
                              if (!car.available) e.preventDefault();
                            }}
                            aria-disabled={!car.available}
                          >
                            Louer maintenant
                          </Link>
                          <Link
                            to={`/car/details/${car._id}`}
                            className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-center"
                          >
                            Voir détails
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {pagination.totalPages > 1 && (
                <nav className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4">
                  <button
                    onClick={() =>
                      dispatch(
                        fetchCars({
                          page: pagination.currentPage - 1,
                          search: filters.search,
                          ville: filters.ville,
                          pays: filters.pays,
                          priceRange: safePriceRange,
                          carTypes: filters.carTypes,
                          minRating: filters.minRating,
                          transmission: filters.transmission,
                          fuelType: filters.fuelType,
                        })
                      )
                    }
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <div className="flex space-x-2">
                    {Array.from(
                      { length: Math.min(5, pagination.totalPages) },
                      (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() =>
                              dispatch(
                                fetchCars({
                                  page,
                                  search: filters.search,
                                  ville: filters.ville,
                                  pays: filters.pays,
                                  priceRange: safePriceRange,
                                  carTypes: filters.carTypes,
                                  minRating: filters.minRating,
                                  transmission: filters.transmission,
                                  fuelType: filters.fuelType,
                                })
                              )
                            }
                            className={`px-4 py-2 text-sm font-medium rounded-md ${
                              pagination.currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                    )}
                    {pagination.totalPages > 5 && (
                      <span className="px-4 py-2 text-sm font-medium text-gray-500">
                        ...
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      dispatch(
                        fetchCars({
                          page: pagination.currentPage + 1,
                          search: filters.search,
                          ville: filters.ville,
                          pays: filters.pays,
                          priceRange: safePriceRange,
                          carTypes: filters.carTypes,
                          minRating: filters.minRating,
                          transmission: filters.transmission,
                          fuelType: filters.fuelType,
                        })
                      )
                    }
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </nav>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md sticky top-20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <FaCar className="mr-2" /> Filtres
                  </h3>
                  <button
                    onClick={handleResetFilters}
                    className="text-sm text-blue-600 hover:underline flex items-center"
                  >
                    <FaTimes className="mr-1" /> Réinitialiser
                  </button>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center mb-3">
                    <RiMoneyDollarCircleLine className="mr-2" /> Gamme de prix
                  </h4>
                  <Slider
                    range
                    min={0}
                    max={1000}
                    value={safePriceRange}
                    onChange={handlePriceChange}
                    className="mb-2"
                    trackStyle={{ backgroundColor: '#2563EB' }}
                    handleStyle={{ borderColor: '#2563EB' }}
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${safePriceRange[0]}</span>
                    <span>${safePriceRange[1]}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center mb-3">
                    <FaCar className="mr-2" /> Type de voiture
                  </h4>
                  <div className="space-y-2">
                    {carTypeOptions.map((type) => (
                      <div key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`type-${type}`}
                          name="carTypes"
                          value={type}
                          checked={filters.carTypes?.includes(type) || false}
                          onChange={handleFilterChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label
                          htmlFor={`type-${type}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center mb-3">
                    <FaStar className="mr-2" /> Note minimale
                  </h4>
                  <select
                    name="minRating"
                    value={filters.minRating || 0}
                    onChange={handleFilterChange}
                    className="block w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="0">Toutes notes</option>
                    <option value="4">4+ étoiles</option>
                    <option value="3">3+ étoiles</option>
                    <option value="2">2+ étoiles</option>
                    <option value="1">1+ étoile</option>
                  </select>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center mb-3">
                    <GiGearStickPattern className="mr-2" /> Transmission
                  </h4>
                  <div className="space-y-2">
                    {['Automatic', 'Manual', 'CVT', 'Semi-Automatic'].map((trans) => (
                      <div key={trans} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`trans-${trans}`}
                          name="transmission"
                          value={trans}
                          checked={filters.transmission?.includes(trans) || false}
                          onChange={handleFilterChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label
                          htmlFor={`trans-${trans}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {trans}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 flex items-center mb-3">
                    <FaGasPump className="mr-2" /> Type de carburant
                  </h4>
                  <div className="space-y-2">
                    {['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'].map((fuel) => (
                      <div key={fuel} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`fuel-${fuel}`}
                          name="fuelType"
                          value={fuel}
                          checked={filters.fuelType?.includes(fuel) || false}
                          onChange={handleFilterChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label
                          htmlFor={`fuel-${fuel}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {fuel}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default CarListing;