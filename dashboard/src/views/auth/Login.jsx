import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaCar, FaKey, FaSignInAlt } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { AiOutlineGoogle } from 'react-icons/ai';
import { FiFacebook } from 'react-icons/fi';
import { PropagateLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { messageClear, seller_login } from '../../store/Reducers/authReducer';

const overrideStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 auto'
};

const Login = () => {
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
    dispatch(seller_login(state));
  };

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      navigate('/seller/dashboard');
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
  }, [successMessage, errorMessage, dispatch, navigate]);

  return (
    <div className='min-w-screen min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex justify-center items-center p-4'>
      <div className='w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden'>
        <div className='p-8'>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='flex justify-center mb-4'>
              <FaCar className='text-4xl text-blue-600' />
            </div>
            <h2 className='text-2xl font-bold text-gray-800'>seller Portal</h2>
            <p className='text-gray-600'>Sign in to manage your fleet</p>
          </div>

          {/* Login Form */}
          <form onSubmit={submit} className='space-y-6'>
            <div className='space-y-4'>
              {/* Email Field */}
              <div className='relative'>
                <MdEmail className='absolute left-3 top-3 text-gray-400' />
                <input
                  onChange={inputHandle}
                  value={state.email}
                  className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
                  type="email"
                  name='email'
                  placeholder='Business Email'
                  required
                />
              </div>

              {/* Password Field */}
              <div className='relative'>
                <FaKey className='absolute left-3 top-3 text-gray-400' />
                <input
                  onChange={inputHandle}
                  value={state.password}
                  className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
                  type="password"
                  name='password'
                  placeholder='Password'
                  required
                />
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
                  <Link to='/forgot-password' className='font-medium text-blue-600 hover:text-blue-500'>
                    Forgot password?
                  </Link>
                </div>
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

            {/* Register Link */}
            <div className='text-center text-sm text-gray-600'>
              Don't have an account?{' '}
              <Link to='/seller/register' className='font-medium text-blue-600 hover:text-blue-500'>
                Register your seller
              </Link>
            </div>
          </form>

          {/* Divider */}
          <div className='mt-6'>
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300'></div>
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-2 bg-white text-gray-500'>Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className='mt-6 grid grid-cols-2 gap-3'>
              <button className='w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50'>
                <span className='sr-only'>Sign in with Google</span>
                <AiOutlineGoogle className='h-5 w-5 text-red-600' />
              </button>
              <button className='w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50'>
                <span className='sr-only'>Sign in with Facebook</span>
                <FiFacebook className='h-5 w-5 text-blue-600' />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;