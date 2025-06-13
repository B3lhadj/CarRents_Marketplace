import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaFacebookF, FaLinkedin, FaCar } from 'react-icons/fa';
import { AiFillGithub, AiOutlineTwitter, AiFillShopping, AiFillHeart } from 'react-icons/ai';
import { useSelector } from 'react-redux';

const Footer = () => {
    const { card_product_count, wishlist_count } = useSelector(state => state.card);
    const navigate = useNavigate();
    const { userInfo } = useSelector(state => state.auth);

    return (
        <footer className='bg-[#F3F6FA]'>
            <div className='max-w-[1440px] px-16 sm:px-5 md-lg:px-12 md:px-10 flex flex-wrap mx-auto border-b py-16 md-lg:pb-10 sm:pb-6'>
                {/* Company Info */}
                <div className='w-3/12 lg:w-4/12 sm:w-full'>
                    <div className='flex flex-col gap-3'>
                        <div className='flex items-center gap-2'>
                            <FaCar className='text-3xl text-[#7fad39]' />
                            <span className='text-2xl font-bold text-gray-800'>RentCar</span>
                        </div>
                        <ul className='flex flex-col gap-2 text-slate-700'>
                            <li className='flex items-center gap-2'>
                                <span className='font-medium'>Address:</span> 
                                <span>Tunis, Tunisia</span>
                            </li>
                            <li className='flex items-center gap-2'>
                                <span className='font-medium'>Phone:</span> 
                                <a href="tel:+21695725831">+216 95 725 831</a>
                            </li>
                            <li className='flex items-center gap-2'>
                                <span className='font-medium'>Email:</span> 
                                <a href="mailto:anisbelhadj.contact@gmail.com">anisbelhadj.contact@gmail.com</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Useful Links */}
                <div className='w-5/12 lg:w-8/12 sm:w-full'>
                    <div className='flex justify-center sm:justify-start sm:mt-6 w-full'>
                        <div>
                            <h2 className='font-bold text-lg mb-2'>Useful Links</h2>
                            <div className='flex justify-between gap-[80px] lg:gap-[40px]'>
                                <ul className='flex flex-col gap-2 text-slate-700 text-sm'>
                                    <li>
                                        <Link to="/about">About Us</Link>
                                    </li>
                                    <li>
                                        <Link to="/fleet">Our Fleet</Link>
                                    </li>
                                    <li>
                                        <Link to="/how-it-works">How It Works</Link>
                                    </li>
                                    <li>
                                        <Link to="/faq">FAQs</Link>
                                    </li>
                                </ul>
                                <ul className='flex flex-col gap-2 text-slate-700 text-sm'>
                                    <li>
                                        <Link to="/terms">Terms of Service</Link>
                                    </li>
                                    <li>
                                        <Link to="/privacy">Privacy Policy</Link>
                                    </li>
                                    <li>
                                        <Link to="/insurance">Insurance Info</Link>
                                    </li>
                                    <li>
                                        <Link to="/contact">Contact Us</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Newsletter & Social */}
                <div className='w-4/12 lg:w-full lg:mt-6'>
                    <div className='w-full flex flex-col justify-start gap-5'>
                        <h2 className='font-bold text-lg mb-2'>Join Our Newsletter</h2>
                        <span className='text-slate-700'>Get updates about special offers and new vehicles</span>
                        <div className='h-[50px] w-full bg-white border relative rounded-md overflow-hidden'>
                            <input 
                                placeholder='Enter your email' 
                                className='h-full bg-transparent w-full px-3 outline-0' 
                                type="email" 
                            />
                            <button className='h-full absolute right-0 bg-[#7fad39] text-white uppercase px-4 font-bold text-sm hover:bg-[#6a9a2a] transition'>
                                Subscribe
                            </button>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <h3 className='font-medium'>Follow Us</h3>
                            <ul className='flex justify-start items-center gap-3'>
                                <li>
                                    <a 
                                        className='w-[38px] h-[38px] hover:bg-[#7fad39] hover:text-white flex justify-center items-center bg-white rounded-full transition' 
                                        href="#"
                                    >
                                        <FaFacebookF />
                                    </a>
                                </li>
                                <li>
                                    <a 
                                        className='w-[38px] h-[38px] hover:bg-[#7fad39] hover:text-white flex justify-center items-center bg-white rounded-full transition' 
                                        href="#"
                                    >
                                        <AiOutlineTwitter />
                                    </a>
                                </li>
                                <li>
                                    <a 
                                        className='w-[38px] h-[38px] hover:bg-[#7fad39] hover:text-white flex justify-center items-center bg-white rounded-full transition' 
                                        href="#"
                                    >
                                        <FaLinkedin />
                                    </a>
                                </li>
                                <li>
                                    <a 
                                        className='w-[38px] h-[38px] hover:bg-[#7fad39] hover:text-white flex justify-center items-center bg-white rounded-full transition' 
                                        href="#"
                                    >
                                        <AiFillGithub />
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className='w-full flex flex-wrap justify-center items-center text-slate-700 mx-auto py-5 text-center'>
                <span>
                    Copyright ©{new Date().getFullYear()} RentCar. All rights reserved | Developed by{' '}
                    <a className='text-[#7fad39] font-medium' href="mailto:anisbelhadj.contact@gmail.com">
                        Anis Belhadj
                    </a>
                </span>
            </div>

            {/* Floating Action Buttons */}
            <div className='hidden fixed md-lg:block w-[50px] bottom-3 h-[110px] right-2 bg-white rounded-full p-2 shadow-lg'>
                <div className='w-full h-full flex gap-3 flex-col justify-center items-center'>
                    <div 
                        onClick={() => navigate(userInfo ? '/cart' : '/login')} 
                        className='relative flex justify-center items-center cursor-pointer w-[35px] h-[35px] rounded-full bg-[#e2e2e2] hover:bg-[#7fad39] hover:text-white transition'
                    >
                        <span className='text-xl text-orange-500 hover:text-white'>
                            <AiFillShopping />
                        </span>
                        {card_product_count !== 0 && (
                            <div className='w-[20px] h-[20px] absolute bg-green-500 rounded-full text-white flex justify-center items-center -top-[3px] -right-[5px] text-xs'>
                                {card_product_count}
                            </div>
                        )}
                    </div>
                    <div 
                        onClick={() => navigate(userInfo ? '/dashboard/my-wishlist' : '/login')} 
                        className='relative flex justify-center items-center cursor-pointer w-[35px] h-[35px] rounded-full bg-[#e2e2e2] hover:bg-[#7fad39] hover:text-white transition'
                    >
                        <span className='text-xl text-red-500 hover:text-white'>
                            <AiFillHeart />
                        </span>
                        {wishlist_count !== 0 && (
                            <div className='w-[20px] h-[20px] absolute bg-green-500 rounded-full text-white flex justify-center items-center -top-[3px] -right-[5px] text-xs'>
                                {wishlist_count}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;