import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { socket } from '../utils/utils';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setActiveCustomer,
  setActiveSeller
} from '../store/Reducers/chatReducer';

const MainLayout = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (!userInfo) return;

    if (userInfo.role === 'seller') {
      socket.emit('add_seller', userInfo._id, userInfo);
    } else {
      socket.emit('add_admin', userInfo);
    }

    return () => {
      // Clean up socket connection when component unmounts
      socket.off('add_seller');
      socket.off('add_admin');
    };
  }, [userInfo]);

  useEffect(() => {
    const handleActiveCustomer = (customers) => {
      dispatch(setActiveCustomer(customers));
    };

    const handleActiveSeller = (sellers) => {
      dispatch(setActiveSeller(sellers));
    };

    socket.on('activeCustomer', handleActiveCustomer);
    socket.on('activeSeller', handleActiveSeller);

    return () => {
      // Clean up socket listeners when component unmounts
      socket.off('activeCustomer', handleActiveCustomer);
      socket.off('activeSeller', handleActiveSeller);
    };
  }, [dispatch]);

  return (
    <div className='relative w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden'>
      {/* Main content container */}
      <div className='relative z-10 w-full min-h-screen'>
        <Header showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
        
        <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
        
        <div className='ml-0 lg:ml-[260px] pt-[95px] transition-all'>
          <div className='p-4 sm:p-6'>
            <div className='bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden'>
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;