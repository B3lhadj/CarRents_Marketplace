import React from 'react'
import { Link } from 'react-router-dom'
import { FaExclamationTriangle, FaHome } from 'react-icons/fa'
import { motion } from 'framer-motion'

const UnAuthorized = () => {
    return (
        <div className='flex w-screen h-screen bg-[#283046] flex-col justify-center items-center p-4 text-center'>
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md bg-[#3B4253] rounded-xl shadow-2xl p-8 flex flex-col items-center"
            >
                <div className="bg-red-500/20 p-4 rounded-full mb-6">
                    <FaExclamationTriangle className="text-red-500 text-5xl" />
                </div>
                
                <h2 className='text-3xl font-bold text-white mb-3'>Access Denied</h2>
                <p className='text-[#D0D2D6] mb-6'>
                    You don't have permission to access this page. Please contact your administrator if you believe this is an error.
                </p>
                
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full"
                >
                    <Link 
                        to={'http://localhost:3000/'}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-3 transition-colors duration-300 w-full"
                    >
                        <FaHome />
                        Back to Dashboard
                    </Link>
                </motion.div>
            </motion.div>
            
            <div className="mt-8 text-[#7E8299] text-sm">
                Error code: 403 - Forbidden
            </div>
        </div>
    )
}


export default UnAuthorized