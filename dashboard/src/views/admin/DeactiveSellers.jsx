
import React, { useEffect, useState } from 'react';
import { FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Pagination from '../Pagination';
import { useDispatch, useSelector } from 'react-redux';
import { get_deactive_sellers } from '../../store/Reducers/sellerReducer';

const DeactiveSellers = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');
    const [parPage, setParPage] = useState(5);

    const { deactiveSellers, totalDeactiveSeller } = useSelector(state => state.seller);
    const dispatch = useDispatch();

    useEffect(() => {
        const obj = {
            parPage: parseInt(parPage),
            page: parseInt(currentPage),
            searchValue
        };
        dispatch(get_deactive_sellers(obj));
    }, [searchValue, currentPage, parPage, dispatch]);

    return (
        <div className='px-4 lg:px-8 pt-6'>
            <div className='w-full p-6 bg-white rounded-xl shadow-lg'>
                <div className='flex flex-col sm:flex-row justify-between items-center gap-4 mb-6'>
                    <select
                        onChange={(e) => setParPage(parseInt(e.target.value))}
                        className='px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white'
                    >
                        <option value="5">5</option>
                        <option value="15">15</option>
                        <option value="25">25</option>
                    </select>
                    <input
                        onChange={e => setSearchValue(e.target.value)}
                        value={searchValue}
                        className='px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400 w-full sm:w-64'
                        type="text"
                        placeholder='Search sellers...'
                    />
                </div>
                <div className='relative overflow-x-auto'>
                    <table className='w-full text-sm text-left text-gray-900'>
                        <thead className='text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200'>
                            <tr>
                                <th scope='col' className='py-3 px-4'>No</th>
                                <th scope='col' className='py-3 px-4'>Image</th>
                                <th scope='col' className='py-3 px-4'>Name</th>
                                <th scope='col' className='py-3 px-4'>Shop Name</th>
                                <th scope='col' className='py-3 px-4'>Payment Status</th>
                                <th scope='col' className='py-3 px-4'>Email</th>
                                <th scope='col' className='py-3 px-4'>Division</th>
                                <th scope='col' className='py-3 px-4'>District</th>
                                <th scope='col' className='py-3 px-4'>Action</th>
                            </tr>
                        </thead>
                        <tbody className='text-sm font-normal'>
                            {deactiveSellers.length > 0 ? (
                                deactiveSellers.map((d, i) => (
                                    <tr key={i} className='hover:bg-gray-50 transition-colors'>
                                        <td scope='row' className='py-3 px-4 font-medium'>{i + 1}</td>
                                        <td scope='row' className='py-3 px-4'>
                                            <img
                                                className='w-[45px] h-[45px] rounded-full border border-gray-200 object-cover'
                                                src={d.image ? d.image : 'https://via.placeholder.com/45'}
                                                alt={d.name || 'Seller'}
                                            />
                                        </td>
                                        <td scope='row' className='py-3 px-4 font-medium'>
                                            <span>{d.name}</span>
                                        </td>
                                        <td scope='row' className='py-3 px-4'>
                                            <span>{d.shopInfo?.shopName || 'N/A'}</span>
                                        </td>
                                        <td scope='row' className='py-3 px-4'>
                                            <span className='px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800'>
                                                {d.payment || 'Inactive'}
                                            </span>
                                        </td>
                                        <td scope='row' className='py-3 px-4'>
                                            <span>{d.email}</span>
                                        </td>
                                        <td scope='row' className='py-3 px-4'>
                                            <span>{d.shopInfo?.division || 'N/A'}</span>
                                        </td>
                                        <td scope='row' className='py-3 px-4'>
                                            <span>{d.shopInfo?.district || 'N/A'}</span>
                                        </td>
                                        <td scope='row' className='py-3 px-4'>
                                            <div className='flex justify-start items-center gap-4'>
                                                <Link
                                                    to={`/admin/dashboard/seller/details/${d._id}`}
                                                    className='p-2 bg-blue-600 text-white rounded hover:bg-blue-700 hover:shadow-lg transition-colors'
                                                >
                                                    <FaEye />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className='py-4 px-4 text-center text-gray-500'>
                                        No deactivated sellers found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalDeactiveSeller > parPage && (
                    <div className='w-full flex justify-end mt-6'>
                        <Pagination
                            pageNumber={currentPage}
                            setPageNumber={setCurrentPage}
                            totalItem={totalDeactiveSeller}
                            parPage={parPage}
                            showItem={4}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeactiveSellers;
