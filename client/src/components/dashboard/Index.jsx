
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserBookings } from '../../store/reducers/bookingReducer';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { PropagateLoader } from 'react-spinners';
import { Sun, Moon } from 'lucide-react'; // Assuming lucide-react for icons

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// Colors for charts
const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6']; // green, yellow, red, blue (for accepted)

const Dashboard = () => {
  const dispatch = useDispatch();
  const { bookings, loading, error } = useSelector(state => state.bookings);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Fetch bookings on component mount
  useEffect(() => {
    console.log('Fetching bookings...');
    dispatch(fetchUserBookings());
  }, [dispatch]);

  // Log bookings for debugging
  useEffect(() => {
    console.log('Bookings in state:', bookings);
    console.log('Loading:', loading, 'Error:', error);
  }, [bookings, loading, error]);

  // Calculate booking statistics
  const { total, completed, pending, cancelled, accepted } = useMemo(() => {
    const stats = bookings.reduce(
      (acc, booking) => {
        acc.total++;
        if (booking.status === 'completed') acc.completed++;
        if (booking.status === 'pending') acc.pending++;
        if (booking.status === 'cancelled') acc.cancelled++;
        if (booking.status === 'accepted') acc.accepted++;
        return acc;
      },
      { total: 0, completed: 0, pending: 0, cancelled: 0, accepted: 0 }
    );
    console.log('Booking stats:', stats);
    return stats;
  }, [bookings]);

  // Prepare data for charts
  const statusData = useMemo(() => {
    const data = {
      labels: ['Completed', 'Pending', 'Cancelled', 'Accepted'],
      datasets: [{
        data: [completed, pending, cancelled, accepted],
        backgroundColor: COLORS,
        borderWidth: 1,
        borderColor: isDarkMode ? '#1F2937' : '#FFFFFF'
      }]
    };
    console.log('Status data:', data);
    return data;
  }, [completed, pending, cancelled, accepted, isDarkMode]);

  const monthlyData = useMemo(() => {
    const months = Array(12).fill(0);
    const bookingYears = new Set();
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.dates.start);
      const month = bookingDate.getMonth();
      months[month]++;
      bookingYears.add(bookingDate.getFullYear());
    });

    const data = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: `Bookings (${[...bookingYears].join(', ')})`,
        data: months,
        backgroundColor: '#3B82F6',
        borderColor: '#1D4ED8',
        borderWidth: 1,
        borderRadius: 4
      }]
    };
    console.log('Monthly data:', data);
    return data;
  }, [bookings]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <PropagateLoader color="#3B82F6" size={15} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Booking Dashboard</h1>
        <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow-md flex items-center justify-between">
          <span>Error loading bookings: {error}</span>
          <button
            onClick={() => dispatch(fetchUserBookings())}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            aria-label="Retry fetching bookings"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Booking Dashboard</h1>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Bookings" 
          value={total} 
          trend={total > 0 ? 'up' : 'neutral'}
          isDarkMode={isDarkMode}
        />
        <StatCard 
          title="Completed" 
          value={completed} 
          trend={completed > 0 ? 'up' : 'neutral'}
          isDarkMode={isDarkMode}
        />
        <StatCard 
          title="Pending" 
          value={pending} 
          trend="neutral"
          isDarkMode={isDarkMode}
        />
        <StatCard 
          title="Accepted" 
          value={accepted} 
          trend={accepted > 0 ? 'up' : 'neutral'}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Booking Status Distribution</h2>
          <div className="h-80">
            {statusData.datasets[0].data.some(value => value > 0) ? (
              <Pie 
                data={statusData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { 
                      position: 'right',
                      labels: { color: isDarkMode ? '#D1D5DB' : '#374151' }
                    },
                    tooltip: { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }
                  }
                }} 
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                No booking status data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Monthly Bookings</h2>
          <div className="h-80">
            {monthlyData.datasets[0].data.some(value => value > 0) ? (
              <Bar 
                data={monthlyData} 
                options={{ 
                  maintainAspectRatio: false,
                  scales: {
                    y: { 
                      beginAtZero: true,
                      ticks: { color: isDarkMode ? '#D1D5DB' : '#374151' },
                      grid: { color: isDarkMode ? '#374151' : '#E5E7EB' }
                    },
                    x: { 
                      ticks: { color: isDarkMode ? '#D1D5DB' : '#374151' },
                      grid: { display: false }
                    }
                  },
                  plugins: {
                    legend: { 
                      labels: { color: isDarkMode ? '#D1D5DB' : '#374151' }
                    },
                    tooltip: { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }
                  }
                }} 
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                No monthly booking data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Bookings</h2>
        {bookings && bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Car</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {bookings.slice(0, 5).map((booking, index) => (
                  <tr 
                    key={booking._id} 
                    className={`transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-600`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {booking.car?.images?.[0] && (
                          <img 
                            className="h-10 w-10 rounded-full object-cover mr-4"
                            src={booking.car.images[0]} 
                            alt={booking.car.name}
                            loading="lazy"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {booking.car?.brand} {booking.car?.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ${booking.car?.pricePerDay}/day
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(booking.dates.start).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        to {new Date(booking.dates.end).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' :
                        booking.status === 'accepted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100' :
                        'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      ${booking.totalPrice}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No bookings found</p>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, trend, isDarkMode }) => {
  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-400 dark:text-gray-500'
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→'
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <div className="mt-2 flex justify-between items-baseline">
        <p className="text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
        <span className={`text-sm font-medium ${trendColors[trend]}`}>
          {trendIcons[trend]}
        </span>
      </div>
    </div>
  );
};

export default Dashboard;