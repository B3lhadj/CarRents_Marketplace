import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaBars, 
  FaCrown, 
  FaClock, 
  FaArrowUp, 
  FaSearch, 
  FaBell,
  FaUserCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import sellerImage from '../assets/seller.png';
import adminImage from '../assets/admin.jpg';

const Header = ({ showSidebar, setShowSidebar }) => {
    const { userInfo } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [searchQuery, setSearchQuery] = useState('');

    // Calculate time left based on subscription endDate
    const calculateTimeLeft = useCallback(() => {
        if (!userInfo?.subscription?.endDate) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        const now = new Date();
        const endDate = new Date(userInfo.subscription.endDate);
        const difference = endDate - now;

        if (difference <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        return { 
            days: Math.max(0, days),
            hours: Math.max(0, hours),
            minutes: Math.max(0, minutes),
            seconds: Math.max(0, seconds)
        };
    }, [userInfo?.subscription?.endDate]);

    // Countdown timer effect
    useEffect(() => {
        if (userInfo?.role !== 'seller') return;

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [userInfo?.role, userInfo?.subscription?.endDate, calculateTimeLeft]);

    const handleUpgradeClick = () => {
        navigate('/seller/dashboard/subscribe', {
            state: {
                currentPlan: userInfo?.subscription?.plan || 'Free',
                isTrial: userInfo?.subscription?.isTrial || false
            }
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const getSubscriptionStatus = () => {
        if (!userInfo?.subscription) return 'inactive';
        
        const now = new Date();
        const endDate = new Date(userInfo.subscription.endDate);
        
        if (endDate < now) return 'expired';
        if (userInfo.subscription.status === 'inactive') return 'inactive';
        return 'active';
    };

    const getPlanColor = () => {
        const status = getSubscriptionStatus();
        switch(status) {
            case 'active':
                return userInfo.subscription.isTrial 
                    ? 'from-blue-500 to-blue-600' 
                    : 'from-purple-500 to-purple-600';
            case 'expired':
                return 'from-red-500 to-red-600';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

    const formatTimeUnit = (value) => {
        return value < 10 ? `0${value}` : value;
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm border-b border-gray-100">
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
                {/* Left Section */}
                <div className="flex items-center space-x-4">
                    {/* Sidebar Toggle */}
                    <button 
                        onClick={() => setShowSidebar(!showSidebar)}
                        className="p-2 text-gray-600 rounded-md hover:bg-gray-100 transition-colors lg:hidden"
                        aria-label="Toggle sidebar"
                    >
                        <FaBars className="w-5 h-5" />
                    </button>
                    
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="relative hidden md:block">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <FaSearch className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 py-2 pl-10 pr-4 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Search dashboard..."
                        />
                    </form>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-4">
                    {/* Plan Info (for sellers) */}
                    {userInfo?.role === 'seller' && (
                        <div className="hidden md:flex items-center space-x-3">
                            <div className={`bg-gradient-to-r ${getPlanColor()} text-white px-3 py-1 rounded-full text-xs font-medium flex items-center shadow-sm`}>
                                <FaCrown className="mr-1.5" />
                                <span>
                                    {userInfo.subscription?.plan || 'No Plan'}
                                    {userInfo.subscription?.isTrial ? ' (Trial)' : ''}
                                </span>
                            </div>
                            
                            {getSubscriptionStatus() === 'active' && (
                                <div className="flex items-center px-3 py-1 bg-amber-50 rounded-full text-xs font-medium text-amber-800 border border-amber-100">
                                    <FaClock className="mr-1.5 text-amber-500" />
                                    <span>
                                        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
                                        {formatTimeUnit(timeLeft.hours)}h {formatTimeUnit(timeLeft.minutes)}m
                                    </span>
                                </div>
                            )}

                            {getSubscriptionStatus() === 'expired' && (
                                <div className="flex items-center px-3 py-1 bg-red-50 rounded-full text-xs font-medium text-red-800 border border-red-100">
                                    <FaExclamationTriangle className="mr-1.5 text-red-500" />
                                    <span>Expired</span>
                                </div>
                            )}

                            <button 
                                onClick={handleUpgradeClick}
                                className={`flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all shadow-sm
                                    ${getSubscriptionStatus() === 'expired' ? 
                                        'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700' :
                                        'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                                    }
                                `}
                            >
                                <FaArrowUp className="mr-1.5" />
                                {getSubscriptionStatus() === 'expired' ? 'Renew Now' : 'Upgrade'}
                            </button>
                        </div>
                    )}

                    {/* Notification */}
                    <button 
                        className="relative p-2 text-gray-500 rounded-full hover:bg-gray-50 transition-colors"
                        aria-label="Notifications"
                    >
                        <FaBell className="w-5 h-5" />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center space-x-2">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-medium text-gray-800 truncate max-w-[120px]">
                                {userInfo?.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                                {userInfo?.role || 'role'}
                            </p>
                        </div>
                        <div className="relative">
                            <img 
                                className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover"
                                src={userInfo?.image || (userInfo?.role === 'admin' ? adminImage : sellerImage)} 
                                alt="Profile" 
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = userInfo?.role === 'admin' ? adminImage : sellerImage;
                                }}
                            />
                            <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white"></span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;