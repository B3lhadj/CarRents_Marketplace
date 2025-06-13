import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { PropagateLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import { get_product, messageClear, delete_product } from '../../store/Reducers/productReducer';

const DeleteProduct = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { productId } = useParams();

    const { product, loader, errorMessage, successMessage } = useSelector(state => state.product);

    // Fetch product details on mount
    useEffect(() => {
        if (productId) {
            dispatch(get_product(productId));
        }
    }, [productId, dispatch]);

    // Show success or error messages
    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            navigate('/seller/dashboard/products');
        }
    }, [successMessage, errorMessage, dispatch, navigate]);

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to permanently delete this vehicle?')) {
            dispatch(delete_product(productId));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-bold text-white flex items-center">
                                <FaExclamationTriangle className="mr-2" />
                                Delete Vehicle
                            </h1>
                            <Link
                                to="/seller/dashboard/products"
                                className="flex items-center text-white hover:text-gray-200 transition-colors"
                            >
                                <FaArrowLeft className="mr-1" />
                                Back to Vehicles
                            </Link>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Warning</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>
                                            You are about to permanently delete this vehicle. This action cannot be undone.
                                            All associated data will be lost.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vehicle Details */}
                        <div className="mb-8">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Name</label>
                                        <div className="text-gray-900 font-medium">{product?.name || 'N/A'}</div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                        <div className="text-gray-900">{product?.brand || 'N/A'}</div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <div className="text-gray-900 capitalize">{product?.category || 'N/A'}</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Daily Rate</label>
                                        <div className="text-gray-900">
                                            ${product?.pricePerDay?.toFixed(2) || '0.00'}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product?.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {product?.available ? 'Available' : 'Rented'}
                                        </span>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                        <div className="text-gray-900">{product?.year || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Image Preview */}
                        {product?.images?.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Vehicle Image</h2>
                                <div className="flex justify-center">
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="h-48 w-full max-w-md object-contain rounded-lg border border-gray-200"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Delete Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleDelete}
                                disabled={loader}
                                className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loader ? (
                                    <PropagateLoader color="#fff" size={10} />
                                ) : (
                                    <>
                                        <FaTrash className="mr-2" />
                                        Permanently Delete Vehicle
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteProduct;