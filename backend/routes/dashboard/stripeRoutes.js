const express = require('express');
const { getStripeBalance, getStripeRevenue } = require('../../services/stripeService');
const { authMiddleware } = require('../../middlewares/authMiddleware'); // Make sure this exists
const router = express.Router();

// Secure all stripe routes with admin authentication
router.use(authMiddleware);

// Get Stripe balance
router.get('/balance', async (req, res) => {
  try {
    const balance = await getStripeBalance();
    res.json({
      success: true,
      data: balance
    });
  } catch (error) {
    console.error('Stripe balance error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch Stripe balance',
      error: error.message 
    });
  }
});

// Get Stripe revenue data with date filtering
router.get('/revenue', async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 30, 365); // Limit to 1 year max
    const revenueData = await getStripeRevenue(days);
    
    res.json({
      success: true,
      data: {
        totalRevenue: revenueData.totalRevenue,
        transactions: revenueData.transactions,
        revenueTrend: revenueData.revenueByDay
      }
    });
  } catch (error) {
    console.error('Stripe revenue error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch revenue data',
      error: error.message 
    });
  }
});

module.exports = router;