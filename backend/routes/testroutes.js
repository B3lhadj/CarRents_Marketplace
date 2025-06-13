const express = require('express');
const router = express.Router();
const SellerWallet = require('../models/sellerWallet');
const { ObjectId } = require('mongoose').Types;

/**
 * @route POST /api/test/setup-wallet
 * @desc Create fake wallet entries with all required fields
 * @access Public (for testing only)
 */
router.post('/setup-wallet', async (req, res) => {
  try {
    const { sellerId } = req.body;
    
    // Clear existing data
    await SellerWallet.deleteMany({ sellerId: new ObjectId(sellerId) });

    // Get current date components
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed in JS

    // Generate test data with all required fields
    const testData = [
      {
        sellerId: new ObjectId(sellerId),
        amount: 500.00,
        month: currentMonth,
        year: currentYear,
        source: 'adjustment',
        createdAt: new Date(currentYear, currentMonth - 1, 1)
      },
      {
        sellerId: new ObjectId(sellerId),
        amount: 327.50,
        month: currentMonth - 1 || 12, // Previous month
        year: currentMonth - 1 ? currentYear : currentYear - 1, // Handle year change
        source: 'order',
        orderId: new ObjectId(),
        createdAt: new Date(currentYear, currentMonth - 2, 15)
      },
      {
        sellerId: new ObjectId(sellerId),
        amount: 198.75,
        month: currentMonth - 2 || 12, // Two months back
        year: currentMonth - 2 ? currentYear : currentYear - 1,
        source: 'order',
        orderId: new ObjectId(),
        createdAt: new Date(currentYear, currentMonth - 3, 10)
      },
      {
        sellerId: new ObjectId(sellerId),
        amount: 45.00,
        month: currentMonth,
        year: currentYear,
        source: 'refund',
        orderId: new ObjectId(),
        createdAt: new Date(currentYear, currentMonth - 1, 20)
      },
      {
        sellerId: new ObjectId(sellerId),
        amount: 275.25,
        month: currentMonth,
        year: currentYear,
        source: 'order',
        orderId: new ObjectId(),
        createdAt: currentDate
      }
    ];

    await SellerWallet.insertMany(testData);

    res.json({
      success: true,
      message: `Created ${testData.length} valid wallet entries`,
      data: testData
    });

  } catch (error) {
    console.error('Test data generation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate test data',
      error: error.message
    });
  }
});

module.exports = router;