import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getNavs } from '../navigation/index';
import { logout } from '../store/Reducers/authReducer';
import { BiLogOut, BiChevronRight } from 'react-icons/bi';
import { FiMenu, FiX } from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import logo from '../assets/logo.png';

const Sidebar = ({ showSidebar, setShowSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { role } = useSelector(state => state.auth);
  const { pathname } = useLocation();
  const [allNav, setAllNav] = useState([]);

  useEffect(() => {
    const navs = getNavs(role);
    setAllNav(navs);
  }, [role]);

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        onClick={() => setShowSidebar(false)} 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${
          showSidebar ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      ></div>

      {/* Sidebar Container - Enhanced with 3D effects */}
      <div 
        className={`fixed w-64 h-screen bg-gradient-to-b from-blue-900/90 to-blue-800/90 backdrop-blur-lg z-50 top-0 shadow-2xl transition-all duration-500 ease-in-out transform ${
          showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px',
          boxShadow: '0 0 30px rgba(0, 0, 255, 0.3)'
        }}
      >
        {/* Sidebar Header with 3D effect */}
        <div 
          className='flex items-center justify-between h-20 px-6 border-b border-blue-700/50'
          style={{
            transform: 'translateZ(20px)'
          }}
        >
          <Link to='/' className='flex items-center group'>
            <div className='relative'>
              <img 
                className='h-10 transition-all duration-300 group-hover:rotate-12' 
                src={logo} 
                alt="Car Rental Admin" 
              />
              <div className='absolute -inset-1 bg-blue-500/20 rounded-full blur group-hover:opacity-70 transition-opacity duration-300'></div>
            </div>
           
          </Link>
          <button 
            onClick={() => setShowSidebar(false)} 
            className='lg:hidden text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-blue-700/50'
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Navigation Items with 3D depth */}
        <div className='overflow-y-auto h-[calc(100vh-5rem)] py-4 px-2'>
          <ul className='space-y-2 px-2'>
            {allNav.map((n, i) => (
              <li key={i}>
                <Link 
                  to={n.path} 
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-300 group
                    ${
                      pathname === n.path 
                        ? 'bg-blue-600/80 shadow-lg text-white transform scale-[1.02]' 
                        : 'text-blue-100 hover:bg-blue-700/50 hover:text-white hover:translate-x-2'
                    }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: pathname === n.path ? 'translateZ(10px)' : 'none'
                  }}
                >
                  <div className='flex items-center'>
                    <span className={`mr-3 text-lg transition-transform duration-300 group-hover:scale-110 ${
                      pathname === n.path ? 'text-white' : 'text-blue-300'
                    }`}>
                      {n.icon || <FaCar />}
                    </span>
                    <span className='font-medium'>{n.title}</span>
                  </div>
                  <BiChevronRight className={`text-xl transition-transform duration-300 ${
                    pathname === n.path ? 'rotate-90' : 'group-hover:translate-x-1'
                  }`} />
                </Link>
              </li>
            ))}
          </ul>

          {/* Logout Button with 3D effect */}
          <div className='absolute bottom-4 left-0 right-0 px-4'>
            <button 
              onClick={() => dispatch(logout({ navigate, role }))} 
              className='flex items-center w-full px-4 py-3 text-red-100 hover:bg-red-700/50 hover:text-white rounded-lg transition-all duration-300 hover:shadow-red-500/20 hover:translate-y-[-2px]'
              style={{
                transformStyle: 'preserve-3d'
              }}
            >
              <BiLogOut className='mr-3 text-xl transition-transform duration-300 group-hover:scale-110' />
              <span className='font-medium'>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;