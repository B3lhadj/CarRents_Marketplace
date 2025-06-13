import React, { useEffect, useRef, useState, memo } from 'react';
import { IoMdClose, IoMdPerson } from 'react-icons/io';
import { FaList, FaCar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  get_customers, 
  messageClear, 
  get_customer_message, 
  send_message, 
  addNewMessage 
} from '../../store/Reducers/chatReducer';
import { socket } from '../../utils/utils';
import { BsEmojiSmile } from 'react-icons/bs';
import { FiSend, FiClock } from 'react-icons/fi';
import { RiChatNewLine } from 'react-icons/ri';
import { HiOutlineStatusOnline, HiOutlineStatusOffline } from 'react-icons/hi';
import { PropagateLoader } from 'react-spinners';

// Customer ID to exclude
const EXCLUDED_CUSTOMER_ID = '67f4895963754d314c77fe0b';

// Reusable Avatar Component
const Avatar = ({ image, name, size = 'md', borderColor = 'gray-200' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };
  return image ? (
    <img 
      className={`${sizeClasses[size]} rounded-full object-cover border-2 border-${borderColor}`} 
      src={image} 
      alt={name || 'User'} 
      loading="lazy"
    />
  ) : (
    <div className={`${sizeClasses[size]} rounded-full bg-gray-100 flex items-center justify-center border-2 border-${borderColor}`}>
      <IoMdPerson className="text-gray-500" />
    </div>
  );
};

// Reusable Customer Item Component
const CustomerItem = memo(({ customer, customerId, onClick }) => (
  <Link 
    to={`/seller/dashboard/chat-customer/${customer.fdId}`} 
    className={`flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-all duration-200 ${
      customerId === customer.fdId ? 'bg-blue-50 border-l-4 border-blue-600' : 'bg-white'
    }`}
    onClick={() => onClick(customer.fdId)}
    aria-label={`Chat with ${customer.name}`}
  >
    <div className='relative'>
      <Avatar image={customer.image} name={customer.name} />
      <div className={`w-2.5 h-2.5 rounded-full absolute bottom-0 right-0 border border-white ${
        customer.online ? 'bg-green-500' : 'bg-gray-400'
      }`} />
    </div>
    <div className='flex-1 min-w-0'>
      <div className='flex justify-between items-center'>
        <h3 className='text-sm font-semibold truncate text-gray-800'>{customer.name}</h3>
        <span className='text-xs text-gray-500'>
          {customer.lastMessage?.time 
            ? new Date(customer.lastMessage.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : new Date(customer.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <p className='text-xs text-gray-600 truncate'>
        {customer.lastMessage?.message || 'No messages yet'}
      </p>
      <div className='flex items-center gap-1 mt-1'>
        {customer.online ? (
          <>
            <HiOutlineStatusOnline className='text-green-500 text-xs' />
            <span className='text-xs text-gray-600'>Online</span>
          </>
        ) : (
          <>
            <HiOutlineStatusOffline className='text-gray-400 text-xs' />
            <span className='text-xs text-gray-600'>Offline</span>
          </>
        )}
      </div>
    </div>
  </Link>
));

// Reusable Message Item Component
const MessageItem = memo(({ message, customerId, currentCustomer, userInfo, scrollRef, isLast }) => {
  const isCustomer = message.senderId === customerId;
  return (
    <div 
      ref={isLast ? scrollRef : null} 
      className={`flex ${isCustomer ? 'justify-start' : 'justify-end'} items-end gap-2 mb-4`}
    >
      {isCustomer && (
        <Avatar image={currentCustomer?.image} name={currentCustomer?.name} size="sm" borderColor="gray-200" />
      )}
      <div className={`max-w-[70%] ${isCustomer ? 'items-start' : 'items-end'}`}>
        <div className={`p-3 rounded-xl shadow-sm ${
          isCustomer 
            ? 'bg-white text-gray-800 border border-gray-100 rounded-bl-none' 
            : 'bg-blue-600 text-white rounded-br-none'
        }`}>
          <span>{message.message}</span>
        </div>
        <span className='text-xs text-gray-500 mt-1 flex items-center gap-1'>
          <FiClock size={10} />
          {new Date(message.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {!isCustomer && (
        <Avatar image={userInfo.image} name={userInfo.name} size="sm" borderColor="gray-200" />
      )}
    </div>
  );
});

const SellerToCustomer = () => {
  const scrollRef = useRef();
  const inputRef = useRef();
  const { userInfo } = useSelector(state => state.auth);
  const { customers, currentCustomer, messages, successMessage, errorMessage, loader } = useSelector(state => state.chat);
  const [receverMessage, setReceverMessage] = useState('');
  const dispatch = useDispatch();
  const [text, setText] = useState('');
  const { customerId } = useParams();
  const [show, setShow] = useState(false);

  // Filter out excluded customer ID
  const filteredCustomers = customers.filter(customer => customer.fdId !== EXCLUDED_CUSTOMER_ID);

  // Fetch customers list
  useEffect(() => {
    if (userInfo?.id) {
      dispatch(get_customers(userInfo.id));
    } else {
      toast.error('Please log in to view customers', { id: 'login-error' });
    }
  }, [dispatch, userInfo?.id]);

  // Fetch messages for selected customer
  useEffect(() => {
    if (customerId) {
      dispatch(get_customer_message(customerId));
    }
  }, [dispatch, customerId]);

  // Handle sending messages
  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !customerId) return;
    
    dispatch(send_message({
      senderId: userInfo.id,
      receverId: customerId,
      text,
      name: userInfo?.shopInfo?.shopName || userInfo?.name || 'Seller'
    }));
    setText('');
    inputRef.current?.focus();
  };

  // Handle socket messages
  useEffect(() => {
    if (successMessage && messages.length > 0) {
      socket.emit('send_seller_message', messages[messages.length - 1]);
      dispatch(messageClear());
    }
  }, [successMessage, dispatch, messages]);

  useEffect(() => {
    const handleCustomerMessage = (msg) => {
      if (msg && msg.senderId && msg.receverId) {
        setReceverMessage(msg);
      }
    };
    socket.on('customer_message', handleCustomerMessage);
    return () => socket.off('customer_message', handleCustomerMessage);
  }, []);

  useEffect(() => {
    if (receverMessage) {
      if (customerId === receverMessage.senderId && userInfo?.id === receverMessage.receverId) {
        dispatch(addNewMessage(receverMessage));
      } else {
        toast.success(`${receverMessage.senderName || 'Customer'} sent a message`, { id: 'new-message' });
        dispatch(messageClear());
      }
    }
  }, [receverMessage, customerId, userInfo?.id, dispatch]);

  // Handle error messages
  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage, { id: 'chat-error' });
      dispatch(messageClear());
    }
  }, [errorMessage, dispatch]);

  // Auto-scroll to latest message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Enter key for form submission
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      sendMessage(e);
    }
  };

  if (!userInfo) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100'>
        <div className='p-6 bg-white rounded-lg shadow-lg text-center'>
          <h3 className='text-xl font-semibold text-gray-800'>Please Log In</h3>
          <p className='text-gray-600 mt-2'>You need to be logged in to access the chat.</p>
          <Link to='/seller/login' className='mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loader) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100'>
        <PropagateLoader color="#2563EB" size={15} aria-label="Loading chats" />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100 p-4 md:p-6'>
      <div className='max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden flex h-[calc(100vh-120px)]'>
        {/* Sidebar */}
        <div className={`w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ${show ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static z-20 shadow-lg md:shadow-none`}>
          <div className='flex items-center justify-between p-4 border-b border-gray-200'>
            <h2 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
              <FaCar className='text-blue-600' /> Customers
            </h2>
            <button 
              onClick={() => setShow(!show)} 
              className='md:hidden text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded'
              aria-label={show ? 'Close sidebar' : 'Open sidebar'}
            >
              <IoMdClose size={24} />
            </button>
          </div>
          <div className='p-4 h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300'>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <CustomerItem 
                  key={customer.fdId} 
                  customer={customer} 
                  customerId={customerId} 
                  onClick={() => console.log('Navigating to customer chat:', customer.fdId)}
                />
              ))
            ) : (
              <div className='flex flex-col items-center justify-center h-full text-gray-600'>
                <RiChatNewLine className='text-4xl mb-3 text-blue-600' />
                <p className='text-sm font-medium'>No customers available</p>
                <p className='text-xs text-gray-500 mt-1'>Customers will appear here when they message you.</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className='flex-1 flex flex-col'>
          <div className='flex items-center justify-between p-4 border-b border-gray-200'>
            {customerId && currentCustomer ? (
              <div className='flex items-center gap-3'>
                <div className='relative'>
                  <Avatar image={currentCustomer.image} name={currentCustomer.name} borderColor="blue-600" />
                  <div className={`w-3 h-3 rounded-full absolute bottom-0 right-0 border border-white ${
                    filteredCustomers.find(c => c.fdId === customerId)?.online ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div>
                  <h2 className='text-lg font-semibold text-gray-800'>{currentCustomer.name || 'N/A'}</h2>
                  <div className='flex items-center gap-1'>
                    {filteredCustomers.find(c => c.fdId === customerId)?.online ? (
                      <>
                        <HiOutlineStatusOnline className='text-green-500 text-sm' />
                        <span className='text-xs text-gray-600'>Online now</span>
                      </>
                    ) : (
                      <>
                        <HiOutlineStatusOffline className='text-gray-400 text-sm' />
                        <span className='text-xs text-gray-600'>Offline</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className='text-gray-800 font-semibold flex items-center gap-2'>
                <RiChatNewLine className='text-blue-600' /> Select a customer to chat
              </div>
            )}
            <button 
              onClick={() => setShow(!show)} 
              className='md:hidden w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'
              aria-label={show ? 'Close sidebar' : 'Open sidebar'}
            >
              <FaList size={18} />
            </button>
          </div>
          <div className='flex-1 p-4 overflow-y-auto bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300'>
            {customerId && currentCustomer ? (
              messages.length > 0 ? (
                messages.map((message, index) => (
                  <MessageItem 
                    key={message.id || index} 
                    message={message} 
                    customerId={customerId} 
                    currentCustomer={currentCustomer} 
                    userInfo={userInfo} 
                    scrollRef={scrollRef}
                    isLast={index === messages.length - 1}
                  />
                ))
              ) : (
                <div className='h-full flex flex-col items-center justify-center text-gray-600'>
                  <BsEmojiSmile className='text-4xl mb-3 text-blue-600' />
                  <p className='text-lg font-medium'>Start a conversation</p>
                  <p className='text-sm text-gray-500 mt-1'>Send your first message to {currentCustomer.name || 'customer'}</p>
                </div>
              )
            ) : (
              <div className='h-full flex flex-col items-center justify-center text-gray-600'>
                <RiChatNewLine className='text-4xl mb-3 text-blue-600' />
                <p className='text-lg font-medium'>No chat selected</p>
                <p className='text-sm text-gray-500 mt-1'>Choose a customer from the list to start chatting</p>
              </div>
            )}
          </div>
          <form onSubmit={sendMessage} className='p-4 bg-white border-t border-gray-200'>
            <div className='flex gap-3'>
              <input 
                ref={inputRef}
                readOnly={!customerId} 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                onKeyPress={handleKeyPress}
                className={`flex-1 p-3 border rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                  !customerId ? 'bg-gray-200 cursor-not-allowed' : ''
                }`} 
                type='text' 
                placeholder={customerId ? 'Type your message...' : 'Select a customer to chat'} 
                aria-label='Message input'
              />
              <button 
                disabled={!customerId || !text.trim()} 
                className={`w-12 h-12 flex items-center justify-center rounded-lg text-white transition-all ${
                  customerId && text.trim() 
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`} 
                type='submit'
                aria-label='Send message'
              >
                <FiSend size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellerToCustomer;