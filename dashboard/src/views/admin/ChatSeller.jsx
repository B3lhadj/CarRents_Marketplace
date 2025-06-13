import React, { useEffect, useState, useRef, useMemo } from 'react';
import { IoMdClose } from 'react-icons/io';
import { FaList } from 'react-icons/fa';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    get_sellers,
    send_message_seller_admin,
    messageClear,
    get_admin_message,
    addNewAdminMessage
} from '../../store/Reducers/chatReducer';
import { BsEmojiSmile } from 'react-icons/bs';
import adminImage from '../../assets/admin.jpg';
import sellerImage from '../../assets/seller.png';
import toast from 'react-hot-toast';
import { socket } from '../../utils/utils';

const ChatSeller = () => {
    const scrollRef = useRef();
    const { sellerId } = useParams();
    const dispatch = useDispatch();
    const { 
        sellers = [], 
        activeSellers = [], 
        seller_admin_messages = [], 
        currentSeller, 
        successMessage, 
        loading = false, 
        errorMessage = '' 
    } = useSelector(state => state.chat);
    const { userInfo } = useSelector(state => state.auth);
    const [show, setShow] = useState(false);
    const [text, setText] = useState('');

    useEffect(() => {
        dispatch(get_sellers()).catch((error) => {
            console.error('Error fetching sellers:', error);
        });
    }, [dispatch]);

    useEffect(() => {
        if (sellerId) {
            dispatch(get_admin_message(sellerId))
                .unwrap()
                .catch((error) => {
                    console.error('Failed to fetch admin messages:', error);
                });
        }
    }, [dispatch, sellerId]);

    const send = (e) => {
        e.preventDefault();
        if (!text.trim() || !sellerId) return;
        const messageData = {
            senderId: userInfo.id,
            receverId: sellerId,
            message: text,
            senderName: 'Myshop support'
        };
        console.log('Sending message:', messageData);
        dispatch(send_message_seller_admin(messageData))
            .unwrap()
            .then((result) => {
                console.log('Send message result:', result);
            })
            .catch((error) => {
                console.error('Failed to send message:', error);
            });
        setText('');
    };

    useEffect(() => {
        if (successMessage && seller_admin_messages.length > 0) {
            const lastMessage = seller_admin_messages[seller_admin_messages.length - 1];
            if (String(lastMessage.senderId) === String(userInfo.id) && String(lastMessage.receverId) === String(sellerId)) {
                console.log('Emitting message to seller:', lastMessage);
                socket.emit('send_message_admin_to_seller', lastMessage);
            }
            dispatch(messageClear());
        }
    }, [successMessage, dispatch, seller_admin_messages, userInfo.id, sellerId]);

    useEffect(() => {
        const handleSellerMessage = (msg) => {
            console.log('Received seller message:', msg);
            if (String(msg.senderId) === String(sellerId) && (String(msg.receverId) === String(userInfo.id) || msg.receverId === 'admin')) {
                dispatch(addNewAdminMessage(msg));
            } else {
                toast.success(`${msg.senderName} sent a message`);
            }
        };
        socket.on('receved_seller_message', handleSellerMessage);
        return () => socket.off('receved_seller_message', handleSellerMessage);
    }, [sellerId, userInfo.id, dispatch]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [seller_admin_messages]);

    useEffect(() => {
        console.log('Redux chat state:', { sellers, activeSellers, seller_admin_messages, currentSeller, loading, errorMessage });
    }, [sellers, activeSellers, seller_admin_messages, currentSeller, loading, errorMessage]);

    console.log('seller_admin_messages:', seller_admin_messages);
    console.log('sellerId:', sellerId, 'userInfo.id:', userInfo.id);

    const conversationMessages = useMemo(() => {
        return seller_admin_messages.filter(msg => {
            const isAdminToSeller = String(msg.senderId) === String(userInfo.id) && String(msg.receverId) === String(sellerId);
            const isSellerToAdmin = String(msg.senderId) === String(sellerId) && (String(msg.receverId) === String(userInfo.id) || msg.receverId === 'admin');
            console.log(`Message ${msg._id || 'new'}: isAdminToSeller=${isAdminToSeller}, isSellerToAdmin=${isSellerToAdmin}`);
            return isAdminToSeller || isSellerToAdmin;
        });
    }, [seller_admin_messages, userInfo.id, sellerId]);

    console.log('Filtered conversationMessages:', conversationMessages);

    return (
        <div className='px-2 lg:px-7 py-5'>
            <div className='w-full bg-[#283046] px-4 py-4 rounded-md h-[calc(100vh-140px)]'>
                <div className='flex w-full h-full relative'>
                    {/* Sellers sidebar */}
                    <div className={`w-[280px] h-full absolute z-10 ${show ? '-left-[16px]' : '-left-[336px]'} md:left-0 md:relative transition-all bg-[#252b3b] md:bg-transparent`}>
                        <div className='w-full h-[calc(100vh-177px)] overflow-y-auto'>
                            <div className='flex text-xl justify-between items-center p-4 md:p-0 md:px-3 md:pb-3 text-white'>
                                <h2>Sellers</h2>
                                <span 
                                    onClick={() => setShow(!show)} 
                                    className='block cursor-pointer md:hidden'
                                >
                                    <IoMdClose />
                                </span>
                            </div>
                            {loading ? (
                                <div className='text-white text-center p-4'>Loading sellers...</div>
                            ) : errorMessage ? (
                                <div className='text-red-500 text-center p-4'>Error: {errorMessage}</div>
                            ) : sellers.length > 0 ? (
                                sellers.map((s, i) => (
                                    <Link 
                                        key={i} 
                                        to={`/admin/dashboard/chat-sellers/${s._id}`} 
                                        className={`h-[60px] flex justify-start gap-2 items-center text-white px-2 rounded-sm py-2 cursor-pointer ${sellerId === s._id ? 'bg-slate-700' : ''}`}
                                    >
                                        <div className='relative'>
                                            <img 
                                                className='w-[38px] h-[38px] border-white border-2 max-w-[38px] p-[2px] rounded-full' 
                                                src={s.image || sellerImage} 
                                                alt={s.name} 
                                            />
                                            {(activeSellers || []).some(a => a.sellerId === s._id) && (
                                                <div className='w-[10px] h-[10px] bg-green-500 rounded-full absolute right-0 bottom-0'></div>
                                            )}
                                        </div>
                                        <div className='flex justify-center items-start flex-col w-full'>
                                            <div className='flex justify-between items-center w-full'>
                                                <h2 className='text-base font-semibold'>{s.name}</h2>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className='text-white text-center p-4'>No sellers found</div>
                            )}
                        </div>
                    </div>

                    {/* Chat area */}
                    <div className='w-full md:w-[calc(100%-200px)] md:pl-4'>
                        <div className='flex justify-between items-center'>
                            {sellerId && currentSeller && (
                                <div className='flex justify-start items-center gap-3'>
                                    <div className='relative'>
                                        <img 
                                            className='w-[42px] h-[42px] border-green-500 border-2 p-[2px] rounded-full' 
                                            src={currentSeller.image || sellerImage} 
                                            alt={currentSeller.name} 
                                        />
                                        {(activeSellers || []).some(a => a.sellerId === sellerId) && (
                                            <div className='w-[10px] h-[10px] bg-green-500 rounded-full absolute right-0 bottom-0'></div>
                                        )}
                                    </div>
                                    <span className='text-white'>{currentSeller.name}</span>
                                </div>
                            )}
                            <div 
                                onClick={() => setShow(!show)} 
                                className='w-[35px] flex md:hidden h-[35px] rounded-sm bg-blue-500 shadow-lg hover:shadow-blue-500/50 justify-center cursor-pointer items-center text-white'
                            >
                                <FaList />
                            </div>
                        </div>
                        
                        <div className='py-4'>
                            <div className='bg-slate-800 h-[calc(100vh-290px)] rounded-md p-3 overflow-y-auto'>
                                {loading ? (
                                    <div className='text-white text-center mb-3'>Loading messages...</div>
                                ) : errorMessage ? (
                                    <div className='text-red-500 text-center mb-3'>Error: {errorMessage}</div>
                                ) : sellerId ? (
                                    conversationMessages.length > 0 ? (
                                        conversationMessages.map((m, i) => (
                                            <div ref={i === conversationMessages.length - 1 ? scrollRef : null} key={m._id || i} className='w-full flex justify-start items-center'>
                                                {String(m.senderId) === String(sellerId) ? (
                                                    <div className='flex justify-start items-start gap-2 md:px-3 py-2 max-w-full lg:max-w-[85%]'>
                                                        <div>
                                                            <img 
                                                                className='w-[38px] h-[38px] border-2 border-white rounded-full max-w-[38px] p-[3px]' 
                                                                src={currentSeller?.image || sellerImage} 
                                                                alt={currentSeller?.name} 
                                                            />
                                                        </div>
                                                        <div className='flex justify-center items-start flex-col w-full bg-orange-500 shadow-lg shadow-orange-500/50 text-white py-1 px-2 rounded-sm'>
                                                            <span>{m.message}</span>
                                                            <span className='text-xs text-white/70 mt-1'>
                                                                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className='w-full flex justify-end items-center'>
                                                        <div className='flex justify-start items-start gap-2 md:px-3 py-2 max-w-full lg:max-w-[85%]'>
                                                            <div className='flex justify-center items-start flex-col w-full bg-blue-500 shadow-lg shadow-blue-500/50 text-white py-1 px-2 rounded-sm'>
                                                                <span>{m.message}</span>
                                                                <span className='text-xs text-white/70 mt-1'>
                                                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <img 
                                                                    className='w-[38px] h-[38px] border-2 border-white rounded-full max-w-[38px] p-[3px]' 
                                                                    src={userInfo.image || adminImage} 
                                                                    alt="Admin" 
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className='w-full h-full flex justify-center items-center flex-col gap-2 text-white'>
                                            <BsEmojiSmile size={24} />
                                            <span>Start chatting with {currentSeller?.name}</span>
                                        </div>
                                    )
                                ) : (
                                    <div className='w-full h-full flex justify-center items-center flex-col gap-2 text-white'>
                                        <BsEmojiSmile size={24} />
                                        <span>Select a seller to chat</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <form onSubmit={send} className='flex gap-3'>
                            <input 
                                required 
                                value={text} 
                                onChange={(e) => setText(e.target.value)} 
                                readOnly={!sellerId} 
                                className='w-full flex justify-between px-2 border border-slate-700 items-center py-[5px] focus:border-blue-500 rounded-md outline-none bg-transparent text-[#d0d2d6]' 
                                type="text" 
                                placeholder={sellerId ? 'Type your message...' : 'Select a seller to chat'} 
                            />
                            <button 
                                disabled={!sellerId || !text.trim()} 
                                className='shadow-lg bg-cyan-500 hover:shadow-cyan-500/50 text-semibold w-[75px] h-[35px] rounded-md text-white flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed'
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatSeller;