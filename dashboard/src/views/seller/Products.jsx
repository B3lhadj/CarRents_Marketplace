import React, { useState, useEffect } from 'react';
import { FaEdit, FaEye, FaTrash, FaSearch, FaCar, FaGasPump, FaTachometerAlt, FaCalendarAlt, FaCogs } from 'react-icons/fa';
import { GiSteeringWheel } from 'react-icons/gi';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Pagination from '../Pagination';
import { get_products, messageClear } from '../../store/Reducers/productReducer';

const Products = () => {
    const dispatch = useDispatch();
    const { products, totalProduct, successMessage, errorMessage } = useSelector(state => state.product);

    const [currentPage, setCurrentPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');
    const [parPage, setParPage] = useState(10);
    const [expandedProduct, setExpandedProduct] = useState(null);

    useEffect(() => {
        const obj = {
            parPage: parseInt(parPage),
            page: parseInt(currentPage),
            searchValue
        };
        dispatch(get_products(obj));
    }, [searchValue, currentPage, parPage, dispatch, successMessage]);

    useEffect(() => {
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => {
                dispatch(messageClear());
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, errorMessage, dispatch]);

    const toggleExpand = (productId) => {
        setExpandedProduct(expandedProduct === productId ? null : productId);
    };

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header and Search */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0 flex items-center">
                    <FaCar className="mr-2 text-blue-600" /> Manage Rental Cars
                </h1>
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search cars..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
            </div>

            {/* Results Count and Items Per Page */}
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * parPage + 1} to {Math.min(currentPage * parPage, totalProduct)} of {totalProduct} vehicles
                </span>
                <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Items per page:</span>
                    <select
                        value={parPage}
                        onChange={(e) => setParPage(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
            </div>

            {/* Cars Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Rate</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product, index) => (
                                <React.Fragment key={product._id}>
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {(currentPage - 1) * parPage + index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-16 w-24">
                                                    <img 
                                                        className="h-16 w-24 rounded-md object-cover border border-gray-200" 
                                                        src={product.images[0]} 
                                                        alt={product.name}
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/96x64?text=No+Image';
                                                        }}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div 
                                                        className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors" 
                                                        onClick={() => toggleExpand(product._id)}
                                                    >
                                                        {product.name}
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-4 mt-1 text-xs text-gray-500">
                                                        <span className="flex items-center">
                                                            <FaCalendarAlt className="mr-1" /> {product.year || 'N/A'}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <FaTachometerAlt className="mr-1" /> {product.mileage ? `${product.mileage} km` : 'N/A'}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <GiSteeringWheel className="mr-1" /> {product.transmission || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                            {product.category}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {product.brand}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {product.discount > 0 ? (
                                                <div className="flex flex-col">
                                                    <span className="text-red-500 line-through">${product.pricePerDay}/day</span>
                                                    <span className="text-green-600 font-medium">
                                                        ${(product.pricePerDay * (1 - product.discount / 100)).toFixed(2)}/day
                                                    </span>
                                                    <span className="text-xs text-green-800 mt-1">Save {product.discount}%</span>
                                                </div>
                                            ) : (
                                                <span className="font-medium">${product.pricePerDay}/day</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {product.available ? 'Available' : 'Rented'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <Link 
                                                    to={`/seller/dashboard/edit-product/${product._id}`}
                                                    className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </Link>
                                                <button 
                                                    onClick={() => toggleExpand(product._id)}
                                                    className="text-purple-600 hover:text-purple-900 p-2 rounded hover:bg-purple-50 transition-colors"
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                </button>
                                                <Link 
                                                    to={`/seller/dashboard/delete-product/${product._id}`}
                                                    className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                    
                                    {/* Expanded Details Row */}
                                    {expandedProduct === product._id && (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-4 bg-gray-50">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                                                <FaCar className="mr-2 text-blue-600" /> Vehicle Details
                                                            </h4>
                                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                                <div className="space-y-2">
                                                                    <div className="text-gray-600 flex items-center">
                                                                        <FaCalendarAlt className="mr-2" /> Year:
                                                                    </div>
                                                                    <div>{product.year || 'N/A'}</div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="text-gray-600 flex items-center">
                                                                        <FaTachometerAlt className="mr-2" /> Mileage:
                                                                    </div>
                                                                    <div>{product.mileage ? `${product.mileage} km` : 'N/A'}</div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="text-gray-600 flex items-center">
                                                                        <GiSteeringWheel className="mr-2" /> Transmission:
                                                                    </div>
                                                                    <div className="capitalize">{product.transmission || 'N/A'}</div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="text-gray-600 flex items-center">
                                                                        <FaGasPump className="mr-2" /> Fuel Type:
                                                                    </div>
                                                                    <div className="capitalize">{product.fuelType || 'N/A'}</div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="text-gray-600 flex items-center">
                                                                        <FaCogs className="mr-2" /> Engine:
                                                                    </div>
                                                                    <div>{product.engine || 'N/A'}</div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="text-gray-600">Seats:</div>
                                                                    <div>{product.seats || 'N/A'}</div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="text-gray-600">Color:</div>
                                                                    <div className="capitalize">{product.color || 'N/A'}</div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="text-gray-600">Location:</div>
                                                                    <div>{product.location || 'N/A'}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {product.features && (
                                                                    Array.isArray(product.features) ? (
                                                                        product.features.map((feature, i) => (
                                                                            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                                                {feature}
                                                                            </span>
                                                                        ))
                                                                    ) : typeof product.features === 'string' ? (
                                                                        product.features.split(',').map((feature, i) => (
                                                                            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                                                {feature.trim()}
                                                                            </span>
                                                                        ))
                                                                    ) : (
                                                                        <span className="text-sm text-gray-500">No features listed</span>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                                                            <div 
                                                                className="text-sm text-gray-600 prose prose-sm max-w-none"
                                                                dangerouslySetInnerHTML={{ __html: product.description || 'No description available' }}
                                                            />
                                                        </div>
                                                        
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 mb-2">Gallery</h4>
                                                            <div className="grid grid-cols-3 gap-2">
                                                                {product.images.map((img, i) => (
                                                                    <img 
                                                                        key={i}
                                                                        src={img} 
                                                                        alt={`${product.name} ${i + 1}`}
                                                                        className="h-24 w-full object-cover rounded border border-gray-200"
                                                                        onError={(e) => {
                                                                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                                                        }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {products.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <FaCar className="mx-auto h-12 w-12" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No vehicles found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchValue ? 'Try changing your search criteria' : 'Add a new vehicle to get started'}
                        </p>
                        <div className="mt-4">
                            <Link
                                to="/seller/dashboard/add-product"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Add New Vehicle
                            </Link>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {totalProduct > parPage && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <Pagination
                            pageNumber={currentPage}
                            setPageNumber={setCurrentPage}
                            totalItem={totalProduct}
                            parPage={parPage}
                            showItem={4}
                        />
                    </div>
                )}
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
                <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-300 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-300 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {errorMessage}
                </div>
            )}
        </div>
    );
};

export default Products;