import React from 'react';
import { Link } from 'react-router-dom';
import { FaCar } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="bg-white shadow-sm fixed w-full z-20">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center text-blue-600 font-bold text-xl">
          <FaCar className="mr-2" />
          DriveShare
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
          <Link to="/cars" className="text-gray-700 hover:text-blue-600">Vehicles</Link>
          <Link to="/about" className="text-gray-700 hover:text-blue-600">About</Link>
          <Link to="/contact" className="text-gray-700 hover:text-blue-600">Contact</Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
          <Link 
            to="/register" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;