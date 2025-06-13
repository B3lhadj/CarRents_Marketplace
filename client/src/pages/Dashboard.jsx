import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  FaCarAlt, 
  FaHistory,
  FaHeart,
  FaComments,
  FaLock,
  FaSignOutAlt,
  FaUserCircle,
  FaCreditCard
} from 'react-icons/fa';
import { MdCarRental } from 'react-icons/md';
import { RxDashboard } from 'react-icons/rx';
import { BiChevronRight } from 'react-icons/bi';
import api from '../api/api';
import { user_reset, customer_logout } from '../store/reducers/authReducer';
import { reset_count } from '../store/reducers/cardReducer';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';
import Headers from '../components/Headers';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [showWelcome, setShowWelcome] = useState(true);

  const logout = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      try {
        // Utilisation de l'action asynchrone de déconnexion
        await dispatch(customer_logout()).unwrap();
        dispatch(reset_count());
        navigate('/login');
        toast.success('Déconnexion réussie', {
          position: 'top-right',
          duration: 3000,
        });
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        toast.error('Échec de la déconnexion', {
          position: 'top-right',
          duration: 3000,
        });
      }
    }
  };

  // Masquer le message de bienvenue après 5 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const navItems = [
    { to: '/dashboard', icon: RxDashboard, title: 'Tableau de bord' },
    { to: '/dashboard/my-orders', icon: FaHistory, title: 'Mes réservations' },
    { to: '/dashboard/my-wishlist', icon: FaHeart, title: 'Profil' },
    { to: '/dashboard/chat', icon: FaComments, title: 'Messages' },
  
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

          body {
            font-family: 'Inter', sans-serif;
          }

          /* Custom Tailwind-like classes */
          .bg-sidebar-primary { background-color: #2563EB; }
          .text-sidebar-primary-foreground { color: #FFFFFF; }
          .bg-sidebar-accent { background-color: #3B82F6; }
          .text-sidebar-accent-foreground { color: #FFFFFF; }
          .text-muted-foreground { color: #FFFFFF; }
          .text-destructive-foreground { color: #FFFFFF; }
          .bg-destructive { background-color: #1F2937; }
          .bg-card { background-color: #FFFFFF; }
          .border-sidebar-border { border-color: #1D4ED8; }

          .sidebar {
            animation: slideIn 0.3s ease-in-out;
          }

          .nav-item {
            transition: all 0.3s ease;
          }

          .nav-item:hover {
            transform: translateX(4px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .logout-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }

          .card {
            border: 1px solid #E5E7EB;
            transition: transform 0.3s ease;
          }

          .card:hover {
            transform: translateY(-2px);
          }

          .welcome-message {
            animation: fadeIn 0.5s ease-in-out;
            opacity: 1;
            transition: opacity 0.5s ease-in-out;
          }

          .welcome-message.hidden {
            opacity: 0;
            pointer-events: none;
          }

          @keyframes slideIn {
            0% { opacity: 0; transform: translateX(-20px); }
            100% { opacity: 1; transform: translateX(0); }
          }

          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(-10px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          /* Responsive adjustments */
          @media (max-width: 768px) {
            .sidebar {
              width: 192px;
            }
            main {
              margin-left: 192px;
              padding: 16px;
            }
            .nav-item span {
              font-size: 14px;
            }
            .logout-btn span {
              font-size: 14px;
            }
          }

          @media (max-width: 640px) {
            .sidebar {
              width: 160px;
            }
            main {
              margin-left: 160px;
              padding: 12px;
            }
            .nav-item span {
              font-size: 12px;
            }
            .logout-btn span {
              font-size: 12px;
            }
            .welcome-message {
              font-size: 14px;
              padding: 12px;
            }
          }
        `}
      </style>

      <Headers />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className="fixed top-0 left-0 w-64 h-screen bg-sidebar-primary z-50 shadow-2xl sidebar"
          aria-hidden="false"
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-sidebar-border">
            <Link to="/" className="flex items-center group">
              <div className="relative">
                <img
                  className="h-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                  src={logo}
                  alt="DriveShare Logo"
                  loading="lazy"
                  onError={(e) => (e.target.src = '/fallback-logo.png')}
                />
                <div className="absolute -inset-1 bg-white/20 rounded-full blur group-hover:opacity-80 transition-opacity duration-300"></div>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="overflow-y-auto h-[calc(100vh-5rem)] py-4 px-2">
            <ul className="space-y-2 px-2">
              {navItems.map((item) => (
                <li key={item.title}>
                  <Link
                    to={item.to}
                    className={`nav-item flex items-center justify-between px-4 py-3 rounded-md group ${
                      pathname === item.to
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                    aria-current={pathname === item.to ? 'page' : undefined}
                    aria-label={`Naviguer vers ${item.title}`}
                  >
                    <div className="flex items-center">
                      <item.icon
                        className={`mr-3 text-lg text-sidebar-primary-foreground group-hover:scale-110 transition-transform duration-300`}
                      />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <BiChevronRight
                      className="text-xl text-sidebar-primary-foreground group-hover:translate-x-1 transition-transform duration-300"
                    />
                  </Link>
                </li>
              ))}
            </ul>

            {/* Logout Button */}
            <div className="absolute bottom-4 left-0 right-0 px-4">
              <button
                onClick={logout}
                className="logout-btn flex items-center w-full px-4 py-3 text-destructive-foreground hover:bg-destructive rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                aria-label="Se déconnecter"
              >
                <FaSignOutAlt className="mr-3 text-xl text-sidebar-primary-foreground group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">Déconnexion</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 ml-64 md:p-8 transition-all duration-300">
          <div className="bg-card rounded-lg shadow-md p-8 min-h-[calc(100vh-120px)] backdrop-blur-sm card">
            {/* Welcome Message */}
            <div
              className={`welcome-message mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded-md ${
                showWelcome ? '' : 'hidden'
              }`}
              aria-live="polite"
              role="alert"
            >
              <p className="font-medium">Bienvenue sur DriveShare !</p>
              <p className="text-sm">Explorez vos options de location de voitures premium.</p>
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;