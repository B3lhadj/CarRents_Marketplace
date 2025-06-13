const router = require('express').Router();
const { authMiddleware } = require('../../middlewares/authMiddleware');
const sellerController = require('../../controllers/dashboard/sellerController');
const Booking = require('../../models/bookingModel');

// Seller profile routes
router.get('/profile/:sellerId', authMiddleware, sellerController.getProfile);
router.put('/profile', authMiddleware, sellerController.updateProfile);

// Authentication routes
router.put('/password',authMiddleware, sellerController.updatePassword); // Changed to not require sellerId in URL
router.put('/email', authMiddleware, sellerController.updateEmail); // Changed to not require sellerId in URL

// Admin management routes
router.get('/requests', authMiddleware, sellerController.getSellerRequests);
router.get('/active', authMiddleware, sellerController.getActiveSellers);
router.post('/status', authMiddleware, sellerController.sellerStatusUpdate);


// Seller car management routes
router.post('/cars', authMiddleware, sellerController.addCar);

// Subscription routes
router.post('/subscribe',  sellerController.sellerSubscribe);
router.get('/get-deactive-sellers', sellerController.getDesactiveSellers);

// Internal route for trial expiry check
router.post('/seller/subscribe', sellerController.sellerSubscribe);
router.get('/bookings/count', authMiddleware, sellerController.getBookingCounts);
router.get('/vehicles/count', authMiddleware, sellerController.getVehicleCount);
router.get('/admin/all', async (req, res) => {
  try {
    // Get query parameters for filtering
    const { status, fromDate, toDate } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    const bookings = await Booking.find(filter)
      .populate('carId', 'brand name images pricePerDay')
      .populate('userId', 'name email')
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings: bookings.map(b => ({
        _id: b._id,
        car: b.carId,
        user: b.userId,
        seller: b.sellerId,
        dates: { start: b.startDate, end: b.endDate },
        status: b.status,
        totalPrice: b.totalPrice,
        createdAt: b.createdAt,
        paymentStatus: b.payment?.status
      }))
    });
  } catch (error) {
    console.error('Admin get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get all bookings'
    });
  }
});
module.exports = router;