import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaCar, FaMapMarkerAlt, FaPhone, FaIdCard, FaBuilding, FaCity } from 'react-icons/fa';
import { MdEmail, MdDescription } from 'react-icons/md';
import { PropagateLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { messageClear, seller_register } from '../../store/Reducers/authReducer';

const overrideStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%'
};

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loader, errorMessage, successMessage } = useSelector(state => state.auth);
  
  const [state, setState] = useState({
    agencyName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    ville: '', // Added city field
    postalCode: '', // Added postal code field
    country: '', // Added country field
    taxId: '',
    businessLicense: '',
    description: '',
    fleetSize: '',
    yearFounded: '',
    contactPerson: '', // Added contact person field
    website: '' // Added website field
  });

  const inputHandle = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value
    });
  };

  const submit = (e) => {
    e.preventDefault();
    dispatch(seller_register(state));
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
      <div className='w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden'>
        <div className='md:flex'>
          {/* Left Side - Branding */}
          <div className='hidden md:block md:w-1/2 bg-blue-800 text-white p-8 flex flex-col justify-center'>
            <div className='mb-8'>
              <FaCar className='text-5xl mb-4 text-blue-300' />
              <h1 className='text-3xl font-bold mb-2'>Join Our Network</h1>
              <p className='text-blue-200'>Register your car rental agency and start growing your business today</p>
            </div>
            <div className='space-y-4'>
              <div className='flex items-center'>
                <div className='bg-blue-700 p-3 rounded-full mr-4'>
                  <FaCar className='text-blue-300' />
                </div>
                <p>Manage your fleet efficiently</p>
              </div>
              <div className='flex items-center'>
                <div className='bg-blue-700 p-3 rounded-full mr-4'>
                  <FaMapMarkerAlt className='text-blue-300' />
                </div>
                <p>Reach thousands of customers</p>
              </div>
              <div className='flex items-center'>
                <div className='bg-blue-700 p-3 rounded-full mr-4'>
                  <FaBuilding className='text-blue-300' />
                </div>
                <p>Grow your business with our platform</p>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className='w-full md:w-1/2 p-8'>
            <div className='text-center mb-8'>
              <h2 className='text-2xl font-bold text-gray-800'>Agency Registration</h2>
              <p className='text-gray-600'>Fill in your agency details</p>
            </div>

            <form onSubmit={submit} className='space-y-4'>
              {/* Agency Information */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-700 border-b pb-2'>Agency Information</h3>
                
                <div className='relative'>
                  <FaBuilding className='absolute left-3 top-3 text-gray-400' />
                  <input 
                    onChange={inputHandle} 
                    value={state.agencyName}
                    className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
                    type="text" 
                    name='agencyName' 
                    placeholder='Agency Name' 
                    required 
                  />
                </div>

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

                <div className='relative'>
                  <FaPhone className='absolute left-3 top-3 text-gray-400' />
                  <input 
                    onChange={inputHandle} 
                    value={state.phone}
                    className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
                    type="tel" 
                    name='phone' 
                    placeholder='Phone Number' 
                    required 
                  />
                </div>

                <div className='relative'>
                  <FaMapMarkerAlt className='absolute left-3 top-3 text-gray-400' />
                  <input 
                    onChange={inputHandle} 
                    value={state.address}
                    className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
                    type="text" 
                    name='address' 
                    placeholder='Street Address' 
                    required 
                  />
                </div>

                <div className='grid grid-cols-3 gap-4'>
                  <div className='relative'>
                    <FaCity className='absolute left-3 top-3 text-gray-400' />
                    <input 
                      onChange={inputHandle} 
                      value={state.ville}
                      className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
                      type="text" 
                      name='ville' 
                      placeholder='City' 
                      required 
                    />
                  </div>
                  <div className='relative'>
                    <input 
                      onChange={inputHandle} 
                      value={state.postalCode}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
                      type="text" 
                      name='postalCode' 
                      placeholder='Postal Code' 
                      required 
                    />
                  </div>
                  <div className='relative'>
                    <input 
                      onChange={inputHandle} 
                      value={state.country}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
                      type="text" 
                      name='country' 
                      placeholder='Country' 
                      required 
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='relative'>
                    <input 
                      onChange={inputHandle} 
                      value={state.fleetSize}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
                      type="number" 
                      name='fleetSize' 
                      placeholder='Number of Vehicles' 
                      min="1"
                    />
                  </div>
                  <div className='relative'>
                    <input 
                      onChange={inputHandle} 
                      value={state.yearFounded}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
                      type="number" 
                      name='yearFounded' 
                      placeholder='Year Established' 
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='relative'>
                    <input 
                      onChange={inputHandle} 
                      value={state.contactPerson}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
                      type="text" 
                      name='contactPerson' 
                      placeholder='Contact Person' 
                    />
                  </div>
                  <div className='relative'>
                    <input 
                      onChange={inputHandle} 
                      value={state.website}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
                      type="url" 
                      name='website' 
                      placeholder='Website URL' 
                    />
                  </div>
                </div>

                <div className='relative'>
                  <MdDescription className='absolute left-3 top-3 text-gray-400' />
                  <textarea
                    onChange={inputHandle} 
                    value={state.description}
                    className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
                    name='description' 
                    placeholder='Business Description' 
                    rows="3"
                  />
                </div>
              </div>

              {/* Legal Information */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-700 border-b pb-2'>Legal Information</h3>
                
                <div className='relative'>
                  <FaIdCard className='absolute left-3 top-3 text-gray-400' />
                  <input 
                    onChange={inputHandle} 
                    value={state.taxId}
                    className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
                    type="text" 
                    name='taxId' 
                    placeholder='Tax Identification Number' 
                    required 
                  />
                </div>

                <div className='relative'>
                  <FaIdCard className='absolute left-3 top-3 text-gray-400' />
                  <input 
                    onChange={inputHandle} 
                    value={state.businessLicense}
                    className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
                    type="text" 
                    name='businessLicense' 
                    placeholder='Business License Number' 
                    required 
                  />
                </div>
              </div>

              {/* Account Security */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-700 border-b pb-2'>Account Security</h3>
                
                <div className='relative'>
                  <input 
                    onChange={inputHandle} 
                    value={state.password}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
                    type="password" 
                    name='password' 
                    placeholder='Create Password' 
                    required 
                  />
                </div>

                <div className='flex items-center'>
                  <input 
                    className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-2'
                    type="checkbox" 
                    name='terms' 
                    id='terms' 
                    required 
                  />
                  <label htmlFor="terms" className='text-sm text-gray-600'>
                    I agree to the <a href="#" className='text-blue-600 hover:underline'>Terms of Service</a> and <a href="#" className='text-blue-600 hover:underline'>Privacy Policy</a>
                  </label>
                </div>
              </div>

              <button 
                disabled={loader} 
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${loader ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {loader ? (
                  <PropagateLoader color='#fff' cssOverride={overrideStyle} size={10} />
                ) : (
                  'Register Agency'
                )}
              </button>

              <div className='text-center text-sm text-gray-600'>
                Already have an account? <Link to='/login' className='text-blue-600 hover:underline'>Sign in</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;