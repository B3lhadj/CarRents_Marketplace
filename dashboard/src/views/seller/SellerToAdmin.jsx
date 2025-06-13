import React, { useEffect, useState, useRef, useMemo } from 'react';
import { 
  send_message_seller_admin, 
  messageClear, 
  get_seller_message, 
  addNewAdminMessage 
} from '../../store/Reducers/chatReducer';
import { useDispatch, useSelector } from 'react-redux';
import { socket } from '../../utils/utils';
import adminImage from '../../assets/admin.jpg';
import sellerImage from '../../assets/seller.png';

const SellerToAdmin = () => {
    const scrollRef = useRef();
    const [text, setText] = useState('');
    const dispatch = useDispatch();
    const { seller_admin_messages = [], successMessage, errorMessage, loading, activeAdmin } = useSelector(state => state.chat);
    const { userInfo } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(get_seller_message()).catch((error) => {
            console.error('Error fetching messages:', error);
        });
    }, [dispatch]);

    useEffect(() => {
        console.log('userInfo.id:', userInfo.id);
        console.log('seller_admin_messages:', seller_admin_messages);
    }, [userInfo.id, seller_admin_messages]);
const receiverId = '67f4895963754d314c77fe0b';

    const send = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        const messageData = {
            senderId: userInfo.id,
            receverId: receiverId,
            message: text,
            senderName: userInfo.name
        };
        console.log('Sending message:', messageData);
        dispatch(send_message_seller_admin(messageData)).then((result) => {
            console.log('Send message result:', result);
        });
        setText('');
    };

    useEffect(() => {
        const handleAdminMessage = (msg) => {
            console.log('Received admin message:', msg);
            if (String(msg.receverId) === String(userInfo.id) || String(msg.senderId) !== String(userInfo.id)) {
                dispatch(addNewAdminMessage(msg));
            }
        };
        socket.on('receved_admin_message', handleAdminMessage);
        return () => socket.off('receved_admin_message', handleAdminMessage);
    }, [dispatch, userInfo.id]);

    useEffect(() => {
        if (successMessage && seller_admin_messages.length > 0) {
            const lastMessage = seller_admin_messages[seller_admin_messages.length - 1];
            if (String(lastMessage.senderId) === String(userInfo.id)) {
                console.log('Emitting message to admin:', lastMessage);
                socket.emit('send_message_seller_to_admin', lastMessage);
            }
            dispatch(messageClear());
        }
    }, [successMessage, dispatch, seller_admin_messages, userInfo.id]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [seller_admin_messages]);

    const conversationMessages = useMemo(() => {
        return seller_admin_messages.filter(msg => {
            console.log('Filtering message:', msg);
            const isSellerToAdmin = String(msg.senderId) === String(userInfo.id) && 
                                  (msg.receverId === String(receiverId) || msg.receverId === 'admin');
            const isAdminToSeller = String(msg.receverId) === String(userInfo.id);
            console.log(`Message ${msg._id}: isSellerToAdmin=${isSellerToAdmin}, isAdminToSeller=${isAdminToSeller}`);
            return isSellerToAdmin || isAdminToSeller;
        });
    }, [seller_admin_messages, userInfo.id]);

    console.log('Filtered conversationMessages:', conversationMessages);

    return (
        <div className='px-2 lg:px-7 py-5'>
            <div className='w-full bg-[#283046] px-4 py-4 rounded-md h-[calc(100vh-140px)]'>
                <div className='flex w-full h-full relative'>
                    <div className='w-full md:pl-4'>
                        <div className='flex justify-between items-center'>
                            <div className='flex justify-start items-center gap-3'>
                                <div className='relative'>
                                    <img 
                                        className='w-[42px] h-[42px] border-green-500 border-2 max-w-[42px] p-[2px] rounded-full' 
                                        src={adminImage} 
                                        alt="admin" 
                                    />
                                    {activeAdmin && (
                                        <div className='w-[10px] h-[10px] bg-green-500 rounded-full absolute right-0 bottom-0'></div>
                                    )}
                                </div>
                                <h2 className='text-base text-white font-semibold'>Support</h2>
                            </div>
                        </div>
                        <div className='py-4'>
                            <div className='bg-slate-800 h-[calc(100vh-290px)] rounded-md p-3 overflow-y-auto'>
                                {loading ? (
                                    <div className='text-white text-center mb-3'>Loading messages...</div>
                                ) : errorMessage ? (
                                    <div className='text-red-500 text-center mb-3'>Error: {errorMessage}</div>
                                ) : conversationMessages.length > 0 ? (
                                    conversationMessages.map((m, index) => {
                                        const isAdminMessage = String(m.senderId) !== String(userInfo.id);
                                        const isLastMessage = index === conversationMessages.length - 1;

                                        return isAdminMessage ? (
                                            <div ref={isLastMessage ? scrollRef : null} key={m._id} className='w-full flex justify-start items-center mb-3'>
                                                <div className='flex justify-start items-start gap-2 md:px-3 py-2 max-w-full lg:max-w-[85%]'>
                                                    <div>
                                                        <img 
                                                            className='w-[38px] h-[38px] border-2 border-white rounded-full max-w-[38px] p-[3px]' 
                                                            src={adminImage} 
                                                            alt="admin" 
                                                        />
                                                    </div>
                                                    <div className='flex justify-center items-start flex-col w-full bg-orange-500 shadow-lg shadow-orange-500/50 text-white py-1 px-2 rounded-sm'>
                                                        <span>{m.message}</span>
                                                        <span className='text-xs text-white/70 mt-1'>
                                                            {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div ref={isLastMessage ? scrollRef : null} key={m._id} className='w-full flex justify-end items-center mb-3'>
                                                <div className='flex justify-start items-start gap-2 md:px-3 py-2 max-w-full lg:max-w-[85%]'>
                                                    <div className='flex justify-center items-start flex-col w-full bg-blue-500 shadow-lg shadow-blue-500/50 text-white py-1 px-2 rounded-sm'>
                                                        <span>{m.message}</span>
                                                        <span className='text-xs text-white/70 mt-1'>
                                                            {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <img 
                                                            className='w-[38px] h-[38px] border-2 border-white rounded-full max-w-[38px] p-[3px]' 
                                                            src={userInfo.image || sellerImage} 
                                                            alt="seller" 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className='w-full h-full flex flex-col items-center justify-center text-white/70'>
                                        <span>No messages yet</span>
                                        <span className='text-sm'>Start the conversation</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <form onSubmit={send} className='flex gap-3'>
                            <input 
                                required 
                                value={text} 
                                onChange={(e) => setText(e.target.value)} 
                                className='w-full flex justify-between px-2 border border-slate-700 items-center py-[5px] focus:border-blue-500 rounded-md outline-none bg-transparent text-[#d0d2d6]' 
                                type="text" 
                                placeholder='Type your message...' 
                            />
                            <button 
                                type="submit"
                                className='shadow-lg bg-cyan-500 hover:shadow-cyan-500/50 text-semibold w-[75px] h-[35px] rounded-md text-white flex justify-center items-center'
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

export default SellerToAdmin;