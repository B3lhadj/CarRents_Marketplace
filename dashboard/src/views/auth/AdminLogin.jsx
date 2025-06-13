import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaLock, FaSignInAlt } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { PropagateLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { admin_login, messageClear } from '../../store/Reducers/authReducer';

const AdminLogin = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loader, errorMessage, successMessage } = useSelector(state => state.auth);
    
    const [state, setState] = useState({
        email: '',
        password: ''
    });

    const inputHandle = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };

    const submit = (e) => {
        e.preventDefault();
        dispatch(admin_login(state));
    };

    const overrideStyle = {
        display: 'flex',
        margin: '0 auto',
        justifyContent: 'center',
        alignItems: "center"
    };

    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            navigate('/admin/dashboard');
        }
    }, [errorMessage, successMessage, dispatch, navigate]);

    return (
        <div className='min-w-screen min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex justify-center items-center p-4'>
            <div className='w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden'>
                <div className='p-8'>
                    {/* Header with Logo */}
                    <div className='text-center mb-8'>
                        <div className='flex justify-center mb-4'>
                            <div className='w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center'>
                                <FaCar className='text-3xl text-blue-600' />
                            </div>
                        </div>
                        <h2 className='text-2xl font-bold text-gray-800'>Admin Portal</h2>
                        <p className='text-gray-600'>Car Rental Management System</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={submit} className='space-y-6'>
                        {/* Email Field */}
                        <div className='space-y-2'>
                            <label htmlFor="email" className='block text-sm font-medium text-gray-700'>
                                Admin Email
                            </label>
                            <div className='relative'>
                                <MdEmail className='absolute left-3 top-3 text-gray-400' />
                                <input
                                    onChange={inputHandle}
                                    value={state.email}
                                    className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
                                    type="email"
                                    name='email'
                                    placeholder='admin@example.com'
                                    id='email'
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className='space-y-2'>
                            <label htmlFor="password" className='block text-sm font-medium text-gray-700'>
                                Password
                            </label>
                            <div className='relative'>
                                <FaLock className='absolute left-3 top-3 text-gray-400' />
                                <input
                                    onChange={inputHandle}
                                    value={state.password}
                                    className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
                                    type="password"
                                    name='password'
                                    placeholder='••••••••'
                                    id='password'
                                    required
                                />
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center'>
                                <input
                                    id='remember-me'
                                    name='remember-me'
                                    type='checkbox'
                                    className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                                />
                                <label htmlFor='remember-me' className='ml-2 block text-sm text-gray-700'>
                                    Remember me
                                </label>
                            </div>
                            <div className='text-sm'>
                                <a href='#' className='font-medium text-blue-600 hover:text-blue-500'>
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            disabled={loader}
                            className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-medium text-white transition-all ${loader ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30'}`}
                        >
                            {loader ? (
                                <PropagateLoader color='#fff' cssOverride={overrideStyle} size={10} />
                            ) : (
                                <>
                                    <FaSignInAlt className='mr-2' />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Note */}
                    <div className='mt-6 text-center text-sm text-gray-500'>
                        <p>Restricted access. Unauthorized entry prohibited.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;