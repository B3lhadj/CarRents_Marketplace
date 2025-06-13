import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { subscribeSeller } from '../../redux/actions/subscriptionAction';

const SubscriptionPlansPopup = ({ onClose = () => {} }) => {
  
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Check authentication status when component mounts or userInfo changes
  useEffect(() => {
    if (!userInfo) {
      setShowLoginPrompt(true);
      setError('Please login to subddscribe');
    } else {
      setShowLoginPrompt(false);
      setError(null);
    }
  }, [userInfo]);

const plans = [
    {
      name: 'Starter',
      price: 29.99,
      duration: 'Month',
      features: ['5 Listings', 'Basic Support', 'Analytics', '3 Month'],
      highlightColor: 'from-blue-50 to-white',
    },
    {
      name: 'Pro',
      price: 79.99,
      duration: 'Month',
      features: ['15 Listings', 'Priority Support', 'Advanced Analytics', '6 Month'],
      highlightColor: 'from-purple-50 to-white',
      popular: true,
    },
    {
      name: 'Elite',
      price: 149.99,
      duration: 'Month',
      features: ['30 Listings', 'Dedicated Support', 'Premium Analytics', '12 Month'],
      highlightColor: 'from-emerald-50 to-white',
    }
  ];

  const handleSelectPlan = (plan) => {
    if (!userInfo) {
      navigate('/login', { state: { from: '/subscription' } });
      return;
    }
    setSelectedPlan(plan);
    setError(null);
  };

  const handleSubscribe = async () => {
    // Early validation checks
    if (!userInfo) {
      navigate('/login', { state: { from: '/subscription' } });
      return;
    }

    if (!selectedPlan) {
      setError('Please select a plan first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await dispatch(
        subscribeSeller({
          sellerId: userInfo._id, // Ensure this matches your backend expectation
          plan: selectedPlan.name,
        })
      )

      if (result?.url) {
        // Redirect to Stripe checkout
        window.location.href = result.url;
      } else {
        throw new Error('Payment URL not received');
      }
    } catch (err) {
      const errorMessage = err?.message || err || 'Subscription failed';
      setError(errorMessage);
      
      // Special handling for authentication errors
      if (errorMessage.toLowerCase().includes('login') || 
          errorMessage.toLowerCase().includes('auth')) {
        navigate('/login', { state: { from: '/subscription' } });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    navigate(-1);
    onClose();
  };

  const handleLoginRedirect = () => {
    navigate('/login', { 
      state: { 
        from: '/subscription',
        plan: selectedPlan?.name // Pass selected plan to login page
      } 
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="p-8">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-gray-900">Upgrade Your Account</h1>
              <p className="text-lg text-gray-600">Choose your plan</p>
            </div>

            {/* Login Prompt */}
            {showLoginPrompt && (
              <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm text-yellow-700">
                      You need to{' '}
                      <button 
                        onClick={handleLoginRedirect}
                        className="font-medium underline text-yellow-700 hover:text-yellow-600"
                      >
                        login
                      </button>{' '}
                      to subscribe.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.name} className="relative h-full">
                  {plan.popular && (
                    <div className="absolute -top-3 left-0 right-0 mx-auto w-32 bg-purple-600 text-white text-xs font-bold py-1 px-3 rounded-full shadow-lg">
                      Popular
                    </div>
                  )}
                  <div
                    className={`h-full flex flex-col border rounded-xl overflow-hidden transition-all duration-200 ${
                      selectedPlan?.name === plan.name
                        ? 'ring-2 ring-blue-500 border-blue-300 shadow-lg'
                        : 'border-gray-200 shadow-md hover:shadow-lg'
                    } ${!userInfo ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => userInfo && handleSelectPlan(plan)}
                  >
                    <div className={`bg-gradient-to-b ${plan.highlightColor} p-6 flex-1 flex flex-col`}>
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                        <div className="mt-4 flex items-center justify-center">
                          <span className="text-4xl font-bold">${plan.price}</span>
                          <span className="ml-1 text-lg text-gray-500">/{plan.duration}</span>
                        </div>
                      </div>
                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <svg
                              className="flex-shrink-0 w-5 h-5 text-green-500 mr-2 mt-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        className={`mt-auto w-full py-2 px-4 rounded-md font-medium ${
                          selectedPlan?.name === plan.name
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-white text-gray-800 border border-gray-300 hover:border-gray-400'
                        } ${!userInfo ? 'cursor-not-allowed' : ''}`}
                        disabled={!userInfo}
                      >
                        {selectedPlan?.name === plan.name ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Subscribe Button (only shown when logged in) */}
            {userInfo && selectedPlan && (
              <div className="mt-10 text-center">
                <button
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors ${
                    isLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    `Subscribe Now - $${selectedPlan.price}/${selectedPlan.duration}`
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

SubscriptionPlansPopup.propTypes = {
  onClose: PropTypes.func,
};

export default SubscriptionPlansPopup;