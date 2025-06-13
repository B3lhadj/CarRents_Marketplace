const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middlewares/authMiddleware');
const customerAuthController = require('../../controllers/home/customerAuthController');
const { verifyToken } = require('../../middlewares/auth');

// Existing routes
router.post('/customer-register', customerAuthController.customer_register);
router.post('/customer-login', customerAuthController.customer_login);
router.get('/get-customer-info', verifyToken, customerAuthController.get_customer_info);
router.put('/update-customer-info', verifyToken, customerAuthController.update_customer_info);
router.get('/customer-logout', customerAuthController.customer_logout);
router.get('/get-dashboard-data', authMiddleware, customerAuthController.get_dashboard_data);

// New password change route
router.patch('/change-password', verifyToken, customerAuthController.changePassword);

module.exports = router;