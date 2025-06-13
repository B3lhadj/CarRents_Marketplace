import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { get_seller, seller_status_update, messageClear } from '../../store/Reducers/sellerReducer';
import toast from 'react-hot-toast';
import { 
  FiUser, FiMail, FiShoppingBag, FiMapPin, FiPhone, 
  FiClock, FiEdit2, FiCheckCircle, FiXCircle, FiAlertCircle 
} from 'react-icons/fi';
import { FaStore, FaRegCreditCard, FaRegCalendarAlt } from 'react-icons/fa';
import { BsShopWindow, BsInfoCircle } from 'react-icons/bs';
import { RiShieldUserLine } from 'react-icons/ri';

const SellerDetails = () => {
    const dispatch = useDispatch();
    const { seller, successMessage } = useSelector((state) => state.seller);
    const { sellerId } = useParams();
    
    const [status, setStatus] = useState('');
    const [activeTab, setActiveTab] = useState('details');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSeller = async () => {
            setIsLoading(true);
            try {
                await dispatch(get_seller(sellerId));
            } catch (error) {
                toast.error('Failed to fetch seller details');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSeller();
    }, [sellerId, dispatch]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
        }
    }, [successMessage, dispatch]);

    useEffect(() => {
        if (seller) {
            setStatus(seller.status);
        }
    }, [seller]);

    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        try {
            await dispatch(seller_status_update({ sellerId, status }));
            toast.success('Status updated successfully');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!seller) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Seller not found</h3>
                    <p className="mt-1 text-gray-500">The seller you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Seller Details</h1>
                        <p className="text-gray-600 mt-1">Manage and view seller information</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            seller?.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {seller?.status === 'active' ? (
                                <FiCheckCircle className="mr-1.5" />
                            ) : (
                                <FiXCircle className="mr-1.5" />
                            )}
                            {seller?.status ? seller.status.charAt(0).toUpperCase() + seller.status.slice(1) : 'N/A'}
                        </span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                    {/* Seller Profile Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                        <div className="flex flex-col md:flex-row items-center">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white bg-opacity-20 mb-4 md:mb-0 md:mr-6 flex items-center justify-center overflow-hidden border-2 border-white border-opacity-30">
                                {seller?.image ? (
                                    <img 
                                        src={seller.image} 
                                        alt="Seller" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/default-avatar.png';
                                        }}
                                    />
                                ) : (
                                    <FiUser className="w-12 h-12 text-white opacity-70" />
                                )}
                            </div>
                            <div className="text-center md:text-left">
                                <h2 className="text-2xl md:text-3xl font-bold">{seller?.name || 'Seller Name'}</h2>
                                <div className="flex items-center justify-center md:justify-start mt-1">
                                    <FaStore className="mr-2 text-blue-200" /> 
                                    <span className="text-blue-100">{seller?.shopInfo?.shopName || 'Shop Name'}</span>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <span className="flex items-center text-sm">
                                        <FiMail className="mr-1.5" /> {seller?.email || 'N/A'}
                                    </span>
                                    <span className="flex items-center text-sm">
                                        <FiPhone className="mr-1.5" /> {seller?.phone || 'N/A'}
                                    </span>
                                    <span className="flex items-center text-sm">
                                        <FaRegCalendarAlt className="mr-1.5" /> Joined {formatDate(seller?.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="border-b border-gray-200 bg-gray-50">
                        <nav className="flex overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                                    activeTab === 'details'
                                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <FiUser className="mr-2" /> Personal Details
                            </button>
                            <button
                                onClick={() => setActiveTab('shop')}
                                className={`py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                                    activeTab === 'shop'
                                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <BsShopWindow className="mr-2" /> Shop Information
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                                    activeTab === 'settings'
                                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <RiShieldUserLine className="mr-2" /> Account Settings
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'details' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Personal Information Card */}
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <FiUser className="mr-2 text-blue-500" /> Personal Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="pb-3 border-b border-gray-100">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</p>
                                            <p className="font-medium mt-1">{seller?.name || 'N/A'}</p>
                                        </div>
                                        <div className="pb-3 border-b border-gray-100">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</p>
                                            <p className="font-medium mt-1">{seller?.email || 'N/A'}</p>
                                        </div>
                                        <div className="pb-3 border-b border-gray-100">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</p>
                                            <p className="font-medium mt-1">{seller?.phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</p>
                                            <p className="font-medium mt-1">{formatDate(seller?.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Business Overview Card */}
                               
                            </div>
                        )}

                        {activeTab === 'shop' && (
                            <div className="space-y-6">
                                {/* Shop Information Card */}
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <BsShopWindow className="mr-2 text-blue-500" /> Shop Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white p-3 rounded-md shadow-sm">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Agency Name</p>
                                            <p className="font-medium mt-1">{seller?.shopInfo?.agencyName || 'N/A'}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-md shadow-sm">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Business License</p>
                                            <p className="font-medium mt-1">{seller?.shopInfo?.businessLicense || 'N/A'}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-md shadow-sm">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tax ID</p>
                                            <p className="font-medium mt-1">{seller?.shopInfo?.taxId || 'N/A'}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-md shadow-sm">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fleet Size</p>
                                            <p className="font-medium mt-1">{seller?.shopInfo?.fleetSize || '0'}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-md shadow-sm">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Year Founded</p>
                                            <p className="font-medium mt-1">{seller?.shopInfo?.yearFounded || 'N/A'}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-md shadow-sm">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Website</p>
                                            <p className="font-medium mt-1">
                                                {seller?.shopInfo?.website ? (
                                                    <a href={seller.shopInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                        {seller.shopInfo.website}
                                                    </a>
                                                ) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Address Information Card */}
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <FiMapPin className="mr-2 text-blue-500" /> Address Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white p-3 rounded-md shadow-sm">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Street</p>
                                            <p className="font-medium mt-1">{seller?.shopInfo?.address?.street || 'N/A'}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-md shadow-sm">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">City</p>
                                            <p className="font-medium mt-1">{seller?.shopInfo?.address?.city || 'N/A'}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-md shadow-sm">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Postal Code</p>
                                            <p className="font-medium mt-1">{seller?.shopInfo?.address?.postalCode || 'N/A'}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-md shadow-sm">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Country</p>
                                            <p className="font-medium mt-1">{seller?.shopInfo?.address?.country || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information Card */}
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <FiPhone className="mr-2 text-blue-500" /> Contact Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white p-3 rounded-md shadow-sm">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Phone</p>
                                            <p className="font-medium mt-1">{seller?.phone || 'N/A'}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-md shadow-sm">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Alternative Phone</p>
                                            <p className="font-medium mt-1">{seller?.shopInfo?.altPhone || 'N/A'}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-md shadow-sm">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</p>
                                            <p className="font-medium mt-1">{seller?.shopInfo?.contactPerson || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Business Hours Card */}
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <FiClock className="mr-2 text-blue-500" /> Business Hours
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white p-3 rounded-md shadow-sm">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Opening Time</p>
                                            <p className="font-medium mt-1">{formatTime(seller?.shopInfo?.openingTime) || 'N/A'}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-md shadow-sm">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Closing Time</p>
                                            <p className="font-medium mt-1">{formatTime(seller?.shopInfo?.closingTime) || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                {/* Account Status Card */}
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <FiEdit2 className="mr-2 text-blue-500" /> Account Status
                                    </h3>
                                    <form onSubmit={handleStatusUpdate}>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                            <div className="md:col-span-2">
                                                <label htmlFor="status" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                                    Change Account Status
                                                </label>
                                                <select
                                                    id="status"
                                                    value={status}
                                                    onChange={(e) => setStatus(e.target.value)}
                                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                                    required
                                                >
                                                    <option value="">Select Status</option>
                                                    <option value="active">Active</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="deactivated">Deactivated</option>
                                                </select>
                                            </div>
                                            <div>
                                                <button
                                                    type="submit"
                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition flex items-center justify-center shadow-sm"
                                                >
                                                    <FiEdit2 className="mr-2" /> Update Status
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                {/* Information Alert */}
                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <BsInfoCircle className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-blue-800">Account Status Information</h3>
                                            <div className="mt-2 text-sm text-blue-700">
                                                <ul className="list-disc pl-5 space-y-1">
                                                    <li><strong>Active:</strong> Seller can access dashboard and manage products</li>
                                                    <li><strong>Pending:</strong> Seller registration requires approval</li>
                                                    <li><strong>Suspended:</strong> Temporary restriction from managing products</li>
                                                    <li><strong>Deactivated:</strong> Permanent account deactivation</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerDetails;