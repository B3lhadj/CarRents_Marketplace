import React, { useState, useEffect } from 'react';
import { FaFacebookF, FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { AiOutlineGoogle } from 'react-icons/ai';
import { RiSteering2Fill } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import FadeLoader from 'react-spinners/FadeLoader';
import { useSelector, useDispatch } from 'react-redux';
import { customer_register, messageClear } from '../store/reducers/authReducer';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loader, successMessage, errorMessage, userInfo } = useSelector((state) => state.auth || {});

  const [state, setState] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'USA'
    }
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const inputHandle = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setState(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setState({
        ...state,
        [name]: value,
      });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!state.name.trim()) newErrors.name = 'Full name is required';
      if (!state.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!state.password) {
        newErrors.password = 'Password is required';
      } else if (state.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
    }
    
    if (step === 2) {
      if (!state.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!state.address.street.trim()) newErrors['address.street'] = 'Street address is required';
      if (!state.address.city.trim()) newErrors['address.city'] = 'City is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    setActiveStep(activeStep - 1);
  };

  const register = (e) => {
    e.preventDefault();
    if (validateStep(activeStep)) {
      dispatch(customer_register(state));
    }
  };

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      
      // Attendre un court instant avant la redirection pour que l'utilisateur voie le message
      const timer = setTimeout(() => {
        navigate('/login'); // Rediriger vers la page de connexion après inscription
      }, 1500);
      
      return () => clearTimeout(timer);
    }
    
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
  }, [successMessage, errorMessage, dispatch, navigate]);

  // Si l'utilisateur est déjà connecté, rediriger vers le tableau de bord
  useEffect(() => {
    if (userInfo) {
      navigate('/dashboard');
    }
  }, [userInfo, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

          body {
            font-family: 'Inter', sans-serif;
          }

          .register-card {
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

          .step-indicator {
            display: flex;
            justify-content: center;
            margin-bottom: 2rem;
          }

          .step {
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #E5E7EB;
            color: #6B7280;
            font-weight: 600;
            margin: 0 0.5rem;
          }

          .step.active {
            background-color: #3B82F6;
            color: white;
          }

          .step.completed {
            background-color: #10B981;
            color: white;
          }

          .step-line {
            flex: 1;
            height: 2px;
            background-color: #E5E7EB;
            margin: 0 0.5rem;
            align-self: center;
          }

          .step-line.completed {
            background-color: #10B981;
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
                <h1 className="text-2xl font-bold">DriveShare</h1>
              </div>
              <p className="text-lg">Join to rent premium cars with ease.</p>
            </div>
          </div>
        </div>

        {/* Right: Register Card */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-500 to-blue-300">
          <div className="w-full max-w-md register-card">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
              <h2 className="text-center text-gray-900 text-xl font-semibold mb-6">
                Create your account
              </h2>

              {/* Step Indicator */}
              <div className="step-indicator">
                <div className={`step ${activeStep >= 1 ? 'active' : ''} ${activeStep > 1 ? 'completed' : ''}`}>
                  {activeStep > 1 ? '✓' : '1'}
                </div>
                <div className={`step-line ${activeStep > 1 ? 'completed' : ''}`}></div>
                <div className={`step ${activeStep >= 2 ? 'active' : ''}`}>2</div>
              </div>

              <form onSubmit={register} className="space-y-6">
                {activeStep === 1 && (
                  <>
                    {/* Name Field */}
                    <div className="space-y-1">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          onChange={inputHandle}
                          value={state.name}
                          type="text"
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors ${
                            errors.name ? 'input-error' : 'border-gray-200'
                          }`}
                          aria-label="Full name"
                        />
                        {errors.name && (
                          <p className="mt-1 error-text">{errors.name}</p>
                        )}
                      </div>
                    </div>

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
                          className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors ${
                            errors.email ? 'input-error' : 'border-gray-200'
                          }`}
                          aria-label="Email address"
                        />
                        {errors.email && (
                          <p className="mt-1 error-text">{errors.email}</p>
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
                          <FaLock className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          onChange={inputHandle}
                          value={state.password}
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          name="password"
                          placeholder="••••••••"
                          className={`block w-full pl-10 pr-10 py-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors ${
                            errors.password ? 'input-error' : 'border-gray-200'
                          }`}
                          aria-label="Password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 error-text">{errors.password}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Use 8 or more characters with a mix of letters, numbers & symbols
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={nextStep}
                      className="w-full btn-primary text-white py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      aria-label="Continue to next step"
                    >
                      Continue
                    </button>
                  </>
                )}

                {activeStep === 2 && (
                  <>
                    {/* Phone Field */}
                    <div className="space-y-1">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaPhone className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          onChange={inputHandle}
                          value={state.phone}
                          type="tel"
                          id="phone"
                          name="phone"
                          placeholder="+1 (555) 123-4567"
                          className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors ${
                            errors.phone ? 'input-error' : 'border-gray-200'
                          }`}
                          aria-label="Phone number"
                        />
                        {errors.phone && (
                          <p className="mt-1 error-text">{errors.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Address Fields */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-700 flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-gray-400" />
                        Address Information
                      </h3>

                      {/* Street Address */}
                      <div className="space-y-1">
                        <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                          Street Address
                        </label>
                        <input
                          onChange={inputHandle}
                          value={state.address.street}
                          type="text"
                          id="address.street"
                          name="address.street"
                          placeholder="123 Main St"
                          className={`block w-full px-3 py-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors ${
                            errors['address.street'] ? 'input-error' : 'border-gray-200'
                          }`}
                          aria-label="Street address"
                        />
                        {errors['address.street'] && (
                          <p className="mt-1 error-text">{errors['address.street']}</p>
                        )}
                      </div>

                      {/* City */}
                      <div className="space-y-1">
                        <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                          City
                        </label>
                        <input
                          onChange={inputHandle}
                          value={state.address.city}
                          type="text"
                          id="address.city"
                          name="address.city"
                          placeholder="New York"
                          className={`block w-full px-3 py-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors ${
                            errors['address.city'] ? 'input-error' : 'border-gray-200'
                          }`}
                          aria-label="City"
                        />
                        {errors['address.city'] && (
                          <p className="mt-1 error-text">{errors['address.city']}</p>
                        )}
                      </div>

                      {/* State and Postal Code */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                            State
                          </label>
                          <input
                            onChange={inputHandle}
                            value={state.address.state}
                            type="text"
                            id="address.state"
                            name="address.state"
                            placeholder="NY"
                            className={`block w-full px-3 py-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors ${
                              errors['address.state'] ? 'input-error' : 'border-gray-200'
                            }`}
                            aria-label="State"
                          />
                          {errors['address.state'] && (
                            <p className="mt-1 error-text">{errors['address.state']}</p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700">
                            ZIP/Postal Code
                          </label>
                          <input
                            onChange={inputHandle}
                            value={state.address.postalCode}
                            type="text"
                            id="address.postalCode"
                            name="address.postalCode"
                            placeholder="10001"
                            className={`block w-full px-3 py-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors ${
                              errors['address.postalCode'] ? 'input-error' : 'border-gray-200'
                            }`}
                            aria-label="Postal code"
                          />
                          {errors['address.postalCode'] && (
                            <p className="mt-1 error-text">{errors['address.postalCode']}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="terms"
                          name="terms"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          required
                          aria-label="Agree to terms"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="terms" className="font-medium text-gray-700">
                          I agree to the{' '}
                          <Link to="/terms" className="text-blue-600 hover:text-blue-500 transition-colors focus:outline-none focus:underline">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link to="/privacy" className="text-blue-600 hover:text-blue-500 transition-colors focus:outline-none focus:underline">
                            Privacy Policy
                          </Link>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="w-full bg-gray-200 text-gray-800 py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                        aria-label="Go back to previous step"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loader}
                        className="w-full btn-primary text-white py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        aria-label="Create account"
                      >
                        {loader ? 'Creating Account...' : 'Create Account'}
                      </button>
                    </div>
                  </>
                )}
              </form>

              {/* Social Login Divider - Only shown on first step */}
              {activeStep === 1 && (
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
                      title="Facebook signup coming soon"
                      aria-label="Sign up with Facebook (coming soon)"
                    >
                      <FaFacebookF className="h-4 w-4 text-blue-600" />
                      <span className="ml-2">Facebook</span>
                    </button>
                    <button
                      type="button"
                      className="social-btn w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      disabled
                      title="Google signup coming soon"
                      aria-label="Sign up with Google (coming soon)"
                    >
                      <AiOutlineGoogle className="h-4 w-4 text-red-600" />
                      <span className="ml-2">Google</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Login Link */}
              <div className="mt-6 text-center text-sm">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors focus:outline-none focus:underline"
                  >
                    Sign in
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

export default Register;