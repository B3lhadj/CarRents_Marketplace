import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FaEye, FaCheck, FaTimes, FaSearch, FaSpinner } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { get_seller_request, seller_status_update } from '../../store/Reducers/sellerReducer';
import Pagination from '../Pagination';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';

const SellerRequest = () => {
    const dispatch = useDispatch();
    const { sellers, totalSeller, loading } = useSelector(state => state.seller);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');
    const [parPage, setParPage] = useState(10);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [processing, setProcessing] = useState(null);

    const StatusBadge = ({ status }) => {
        const statusClasses = {
            pending: 'bg-yellow-100 text-yellow-800',
            active: 'bg-green-100 text-green-800',
            deactive: 'bg-red-100 text-red-800',
            rejected: 'bg-gray-100 text-gray-800'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses[status] || 'bg-gray-100'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const PaymentBadge = ({ payment }) => {
        const paymentClasses = {
            active: 'bg-blue-100 text-blue-800',
            inactive: 'bg-orange-100 text-orange-800',
            pending: 'bg-purple-100 text-purple-800'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${paymentClasses[payment] || 'bg-gray-100'}`}>
                {payment.charAt(0).toUpperCase() + payment.slice(1)}
            </span>
        );
    };

    const handleSearchChange = useCallback(
        debounce((value) => {
            setSearchValue(value);
            setCurrentPage(1);
        }, 300),
        []
    );

    const requestParams = useMemo(() => ({
        parPage,
        searchValue,
        page: currentPage,
        status: statusFilter !== 'all' ? statusFilter : '',
        payment: paymentFilter !== 'all' ? paymentFilter : ''
    }), [parPage, searchValue, currentPage, statusFilter, paymentFilter]);

    useEffect(() => {
        const abortController = new AbortController();
        
        const fetchSellers = async () => {
            try {
                await dispatch(get_seller_request({
                    ...requestParams,
                    signal: abortController.signal
                }));
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error fetching sellers:', error);
                    toast.error('Failed to load seller requests');
                }
            }
        };

        fetchSellers();

        return () => abortController.abort();
    }, [requestParams, dispatch]);

    const handleViewDetails = (seller) => {
        setSelectedSeller(seller);
        setShowModal(true);
    };

    const handleStatusUpdate = async (sellerId, status) => {
        if (processing) return;
        
        setProcessing(sellerId);
        const action = status === 'active' ? 'approved' : 'rejected';
        const toastId = toast.loading(`Processing ${action} request...`);
        
        try {
            const { payload } = await dispatch(seller_status_update({ sellerId, status }));
            
            if (payload?.success) {
                toast.update(toastId, {
                    render: `Seller ${action} successfully! Reloading...`,
                    type: 'success',
                    isLoading: false,
                    autoClose: 2000
                });

                // Reload seller data after a short delay
                setTimeout(() => {
                    dispatch(get_seller_request(requestParams));
                }, 1000);
            } else {
                toast.update(toastId, {
                    render: payload?.message || `Failed to ${action} seller`,
                    type: 'error',
                    isLoading: false,
                    autoClose: 5000
                });
            }
        } catch (error) {
            toast.update(toastId, {
                render: `An error occurred while ${action} seller`,
                type: 'error',
                isLoading: false,
                autoClose: 5000
            });
            console.error('Status update error:', error);
        } finally {
            setProcessing(null);
        }
    };

    const SkeletonRow = () => (
        <tr className="animate-pulse">
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
            <td className="px-6 py-4">
                <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="ml-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
        </tr>
    );

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header and Filters */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Seller Requests
                            {loading && <span className="ml-2 text-sm text-gray-500">Loading...</span>}
                        </h2>
                        
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search sellers..."
                                    className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                />
                            </div>
                            
                            <div className="flex gap-2">
                                <select
                                    className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="active">Active</option>
                                    <option value="deactive">Deactivated</option>
                                </select>
                                
                                <select
                                    className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                    value={paymentFilter}
                                    onChange={(e) => {
                                        setPaymentFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="all">All Payments</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                Array.from({ length: parPage }).map((_, index) => (
                                    <SkeletonRow key={`skeleton-${index}`} />
                                ))
                            ) : sellers.length > 0 ? (
                                sellers.map((seller, index) => (
                                    <tr key={seller._id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {(currentPage - 1) * parPage + index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {seller.image ? (
                                                        <img 
                                                            className="h-10 w-10 rounded-full object-cover" 
                                                            src={seller.image} 
                                                            alt={seller.name}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = 'https://via.placeholder.com/40';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <span className="text-gray-500 font-medium">
                                                                {seller.name?.charAt(0)?.toUpperCase() || '?'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {seller.name || 'No name'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {seller.shopInfo?.agencyName || 'No agency name'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{seller.email}</div>
                                            <div className="text-sm text-gray-500">{seller.phone || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <PaymentBadge payment={seller.payment} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={seller.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end items-center space-x-2">
                                                <button
                                                    onClick={() => handleViewDetails(seller)}
                                                    className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-2 rounded-full hover:bg-blue-50"
                                                >
                                                    <FaEye className="h-4 w-4" />
                                                </button>
                                                
                                                {seller.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(seller._id, 'active')}
                                                            disabled={processing === seller._id}
                                                            className={`text-green-600 hover:text-green-900 transition-colors duration-200 p-2 rounded-full hover:bg-green-50 ${processing === seller._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            {processing === seller._id ? (
                                                                <FaSpinner className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <FaCheck className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(seller._id, 'rejected')}
                                                            disabled={processing === seller._id}
                                                            className={`text-red-600 hover:text-red-900 transition-colors duration-200 p-2 rounded-full hover:bg-red-50 ${processing === seller._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            {processing === seller._id ? (
                                                                <FaSpinner className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <FaTimes className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No sellers found matching your criteria
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalSeller > parPage && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-medium">{(currentPage - 1) * parPage + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(currentPage * parPage, totalSeller)}</span> of{' '}
                            <span className="font-medium">{totalSeller}</span> sellers
                        </div>
                        <div className="flex-1 flex justify-end">
                            <Pagination
                                pageNumber={currentPage}
                                setPageNumber={setCurrentPage}
                                totalItem={totalSeller}
                                parPage={parPage}
                                showItem={5}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Seller Details Modal */}
            {showModal && selectedSeller && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div 
                            className="fixed inset-0 transition-opacity" 
                            onClick={() => setShowModal(false)}
                        >
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
                        
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                                Seller Details: {selectedSeller.name || 'Unknown Seller'}
                                            </h3>
                                            <button
                                                onClick={() => setShowModal(false)}
                                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                            >
                                                <span className="sr-only">Close</span>
                                                <FaTimes className="h-6 w-6" />
                                            </button>
                                        </div>
                                        
                                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="text-md font-medium text-gray-900 mb-3">
                                                    Basic Information
                                                </h4>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</p>
                                                        <p className="mt-1 text-sm text-gray-900">{selectedSeller.name || '-'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</p>
                                                        <p className="mt-1 text-sm text-gray-900">{selectedSeller.email || '-'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</p>
                                                        <p className="mt-1 text-sm text-gray-900">{selectedSeller.phone || '-'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</p>
                                                        <p className="mt-1 text-sm text-gray-900">
                                                            {selectedSeller.createdAt ? new Date(selectedSeller.createdAt).toLocaleDateString() : '-'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</p>
                                                        <div className="mt-1">
                                                            <StatusBadge status={selectedSeller.status} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</p>
                                                        <div className="mt-1">
                                                            <PaymentBadge payment={selectedSeller.payment} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="text-md font-medium text-gray-900 mb-3">
                                                    Shop Information
                                                </h4>
                                                {selectedSeller.shopInfo ? (
                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Agency Name</p>
                                                            <p className="mt-1 text-sm text-gray-900">{selectedSeller.shopInfo.agencyName || '-'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address</p>
                                                            <p className="mt-1 text-sm text-gray-900">
                                                                {selectedSeller.shopInfo.address?.street || 'Not specified'},<br />
                                                                {selectedSeller.shopInfo.address?.city || 'Not specified'},<br />
                                                                {selectedSeller.shopInfo.address?.country || 'Not specified'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</p>
                                                            <p className="mt-1 text-sm text-gray-900">{selectedSeller.shopInfo.contactPerson || '-'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Business License</p>
                                                            <p className="mt-1 text-sm text-gray-900">{selectedSeller.shopInfo.businessLicense || '-'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tax ID</p>
                                                            <p className="mt-1 text-sm text-gray-900">{selectedSeller.shopInfo.taxId || '-'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fleet Size</p>
                                                            <p className="mt-1 text-sm text-gray-900">{selectedSeller.shopInfo.fleetSize || '0'}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500">No shop information available</p>
                                                )}
                                            </div>
                                        </div>

                                        {selectedSeller.subscription && (
                                            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                                                <h4 className="text-md font-medium text-gray-900 mb-3">
                                                    Subscription Information
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</p>
                                                        <p className="mt-1 text-sm text-gray-900">{selectedSeller.subscription.plan}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</p>
                                                        <div className="mt-1">
                                                            <StatusBadge status={selectedSeller.subscription.status} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Car Limit</p>
                                                        <p className="mt-1 text-sm text-gray-900">{selectedSeller.subscription.carLimit}</p>
                                                    </div>
                                                    {selectedSeller.subscription.startDate && (
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</p>
                                                            <p className="mt-1 text-sm text-gray-900">
                                                                {new Date(selectedSeller.subscription.startDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {selectedSeller.subscription.endDate && (
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</p>
                                                            <p className="mt-1 text-sm text-gray-900">
                                                                {new Date(selectedSeller.subscription.endDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {selectedSeller.shopInfo?.description && (
                                            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                                                <h4 className="text-md font-medium text-gray-900 mb-3">
                                                    Business Description
                                                </h4>
                                                <p className="text-sm text-gray-700">
                                                    {selectedSeller.shopInfo.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                                    onClick={() => setShowModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(SellerRequest);