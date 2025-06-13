import React, { useState, useEffect } from 'react';
import { FaFacebookF, FaKey, FaEnvelope } from 'react-icons/fa';
import { AiOutlineGoogle } from 'react-icons/ai';
import { RiSteering2Fill } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import FadeLoader from 'react-spinners/FadeLoader';
import { useSelector, useDispatch } from 'react-redux';
import { customer_login, messageClear } from '../store/reducers/authReducer';
import toast from 'react-hot-toast';

const Login = () => {
    const { loader, successMessage, errorMessage, userInfo } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [state, setState] = useState({
        email: '',
        password: '',
    });

    const inputHandle = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value,
        });
    };

    const login = (e) => {
        e.preventDefault();
        dispatch(customer_login(state));
    };

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
        if (userInfo) {
            navigate('/dashboard');
        }
    }, [successMessage, errorMessage, userInfo, dispatch, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

                    body {
                        font-family: 'Inter', sans-serif;
                    }

                    .login-card {
                        animation: fadeIn 0.5s ease-in-out;
                    }

                    @keyframes fadeIn {
                        0% { opacity: 0; transform: translateY(20px); }
                        100% { opacity: 1; transform: translateY(0); }
                    }

                    .btn-primary {
                        background: linear-gradient(90deg, #1D4ED8 0%, #3B82F6 100%);
                        transition: transform 0.3s ease, box-shadow 0.3s ease;
                    }

                    .btn-primary:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 12px rgba(29, 78, 216, 0.3);
                    }

                    .btn-primary:disabled {
                        background: #6B7280;
                        cursor: not-allowed;
                    }

                    .social-btn {
                        transition: transform 0.3s ease, box-shadow 0.3s ease;
                    }

                    .social-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    }

                    .image-overlay::after {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(135deg, rgba(29, 78, 216, 0.4), rgba(0, 0, 0, 0.3));
                    }

                    .input-error {
                        border-color: #EF4444;
                    }

                    .error-text {
                        color: #EF4444;
                        font-size: 0.75rem;
                    }
                `}
            </style>

            {/* Loading Overlay */}
            {loader && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <FadeLoader color="#3B82F6" />
                </div>
            )}

            {/* Main Content */}
            <div className="flex w-full">
                {/* Left: Image */}
                <div className="hidden lg:block w-1/2 relative">
                    <div className="image-overlay">
                        <img
                            src="/images/Car finance-rafiki.png"
                            alt="Luxury car"
                            className="w-full h-screen object-cover"
                            loading="lazy"
                            onError={(e) => (e.target.src = '/fallback-car-image.jpg')}
                        />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                            <div className="flex items-center justify-center space-x-2 mb-4">
                                <RiSteering2Fill className="text-3xl" />
                              
                            </div>
                            <p className="text-lg">Rent premium cars with ease.</p>
                        </div>
                    </div>
                </div>

                {/* Right: Login Card */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-500 to-blue-300">
                    <div className="w-full max-w-md login-card">
                        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                            <h2 className="text-center text-gray-900 text-xl font-semibold mb-6">
                                Sign in to your account
                            </h2>
                            <form onSubmit={login} className="space-y-6">
                                {/* Email Field */}
                                <div className="space-y-1">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaEnvelope className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            onChange={inputHandle}
                                            value={state.email}
                                            type="email"
                                            id="email"
                                            name="email"
                                            placeholder="your@email.com"
                                            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors ${errorMessage && errorMessage.includes('email') ? 'input-error' : 'border-gray-200'}`}
                                            required
                                            aria-label="Email address"
                                        />
                                        {errorMessage && errorMessage.includes('email') && (
                                            <p className="mt-1 error-text">{errorMessage}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-1">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaKey className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            onChange={inputHandle}
                                            value={state.password}
                                            type="password"
                                            id="password"
                                            name="password"
                                            placeholder="••••••••"
                                            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors ${errorMessage && errorMessage.includes('password') ? 'input-error' : 'border-gray-200'}`}
                                            required
                                            aria-label="Password"
                                        />
                                        {errorMessage && errorMessage.includes('password') && (
                                            <p className="mt-1 error-text">{errorMessage}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Remember Me & Forgot Password */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            id="remember-me"
                                            name="remember-me"
                                            type="checkbox"
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            aria-label="Remember me"
                                        />
                                        <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-600">
                                            Remember me
                                        </label>
                                    </div>
                                    <Link
                                        to="/forgot-password"
                                        className="text-xs font-medium text-blue-600 hover:text-blue-500 transition-colors focus:outline-none focus:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loader}
                                    className="w-full btn-primary text-white py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    aria-label="Sign in"
                                >
                                    {loader ? 'Signing in...' : 'Sign in'}
                                </button>
                            </form>

                            {/* Social Login Divider */}
                            <div className="mt-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                    </div>
                                </div>

                                {/* Social Login Buttons */}
                                <div className="mt-6 grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        className="social-btn w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        disabled
                                        title="Facebook login coming soon"
                                        aria-label="Sign in with Facebook (coming soon)"
                                    >
                                        <FaFacebookF className="h-4 w-4 text-blue-600" />
                                        <span className="ml-2">Facebook</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="social-btn w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        disabled
                                        title="Google login coming soon"
                                        aria-label="Sign in with Google (coming soon)"
                                    >
                                        <AiOutlineGoogle className="h-4 w-4 text-red-600" />
                                        <span className="ml-2">Google</span>
                                    </button>
                                </div>
                            </div>

                            {/* Sign Up Link */}
                            <div className="mt-6 text-center text-sm">
                                <p className="text-gray-600">
                                    Don't have an account?{' '}
                                    <Link
                                        to="/register"
                                        className="font-medium text-blue-600 hover:text-blue-500 transition-colors focus:outline-none focus:underline"
                                    >
                                        Sign up
                                    </Link>
                                </p>
                            </div>
                        </div>

                        {/* Footer Note */}
                        <div className="mt-4 text-center text-xs text-white">
                            <p>© {new Date().getFullYear()} DriveShare. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;