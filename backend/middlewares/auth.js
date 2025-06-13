const jwt = require('jsonwebtoken');
const customers = require('../models/customerModel');
const sellers = require('../models/sellerModel');

const verifyToken = async (req, res, next) => {
    console.log('[Auth] Starting token verification process...');
    
    let token;
    
    // Token extraction with logging
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('[Auth] Token extracted from Authorization header');
    } else if (req.cookies?.customerToken) {
      token = req.cookies.customerToken;
      console.log('[Auth] Token extracted from customerToken cookie');
    } else if (req.cookies?.sellerToken) {
      token = req.cookies.sellerToken;
      console.log('[Auth] Token extracted from sellerToken cookie');
    }
  
    if (!token) {
      console.log('[Auth] No token found in headers or cookies');
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, no token provided' 
      });
    }
  
    console.log('[Auth] Token found:', token.length > 50 ? 
      `${token.substring(0, 20)}...${token.slice(-20)}` : token);
  
    try {
      // Verify token with secret
      console.log('[Auth] Verifying token with secret:', 
        process.env.SECRET ? 'SECRET exists' : 'SECRET missing in env');
      
      const decoded = jwt.verify(token, process.env.SECRET);
      console.log('[Auth] Token successfully decoded:', {
        id: decoded.id,
        iat: decoded.iat,
        exp: decoded.exp
      });
  
      // Check customer collection
      console.log('[Auth] Searching for customer with ID:', decoded.id);
      let user = await customers.findById(decoded.id).select('-password');
      
      if (user) {
        console.log('[Auth] Found customer user:', {
          id: user._id,
          email: user.email,
          name: user.name
        });
      } else {
        console.log('[Auth] No customer found, checking sellers...');
        user = await sellers.findById(decoded.id).select('-password');
        
        if (user) {
          console.log('[Auth] Found seller user:', {
            id: user._id,
            email: user.email,
            name: user.name
          });
          req.isSeller = true;
        }
      }
  
      if (!user) {
        console.log('[Auth] ERROR: No user found in either collection for ID:', decoded.id);
        return res.status(401).json({ 
          success: false,
          message: 'User not fouddnd' 
        });
      }
  
      req.user = user;
      console.log('[Auth] Authentication successful for:', user.email);
      next();
    } catch (error) {
      console.error('[Auth] Token verification failed:', {
        errorName: error.name,
        message: error.message,
        stack: error.stack
      });
  
      let message = 'Not authorized, invalid token';
      if (error.name === 'TokenExpiredError') {
        message = 'Session expired, please login again';
      } else if (error.name === 'JsonWebTokenError') {
        message = `Invalid token: ${error.message}`;
        console.log('[Auth] Token content:', jwt.decode(token));
      }
  
      res.status(401).json({ 
        success: false,
        message 
      });
    }
  };

  module.exports = { verifyToken };