const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment/paymentController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

// =======================
//   SELLER ROUTES
// =======================

/**
 * @route GET /api/payments/balance
 * @desc Get seller's available balance
 * @access Private (Seller)
 */
router.get('/balance', authMiddleware, paymentController.getSellerBalance);

/**
 * @route GET /api/payments/seller/:sellerId
 * @desc Get seller payment details (balance + history)
 * @access Private (Seller/Admin)
 */
router.get('/seller/:sellerId', authMiddleware, paymentController.getSellerPaymentDetails);

/**
 * @route POST /api/payments/withdrawals
 * @desc Create withdrawal request
 * @access Private (Seller)
 */
router.post('/withdrawals', authMiddleware, paymentController.createWithdrawal);

/**
 * @route GET /api/payments/withdrawals/history
 * @desc Get withdrawal history for current seller
 * @access Private (Seller)
 */
router.get('/withdrawals/history', authMiddleware, paymentController.getWithdrawalHistory);

// =======================
//      ADMIN ROUTES
// =======================

/**
 * @route GET /api/admin/withdrawals
 * @desc Get all withdrawal requests (paginated)
 * @access Private (Admin)
 */
router.get('/admin/withdrawals', 
  authMiddleware,
  paymentController.getAllWithdrawals
);

/**
 * @route GET /api/admin/withdrawals/:withdrawalId
 * @desc Get withdrawal details
 * @access Private (Admin)
 */
//router.get('/admin/withdrawals/:withdrawalId', 
  //authMiddleware,
//  paymentController.getWithdrawalDetails
//);

/**
 * @route PATCH /api/admin/withdrawals/:withdrawalId/process
 * @desc Process a withdrawal (approve/reject)
 * @access Private (Admin)
 */
router.patch('/admin/withdrawals/:withdrawalId/process', 
  authMiddleware,
  paymentController.processWithdrawal
);

/**
 * @route GET /api/admin/withdrawals/stats
 * @desc Get withdrawal statistics
 * @access Private (Admin)
 */
router.get('/admin/withdrawals/stats', 
  authMiddleware,
  paymentController.getWithdrawalStats
);


module.exports = router;