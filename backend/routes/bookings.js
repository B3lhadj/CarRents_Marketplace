const express = require('express');
const router = express.Router();
const Booking = require('../models/bookingModel');
const cars = require('../models/productModel');
const SellerWallet = require('../models/sellerWallet');
const stripe = require('stripe')(process.env.stripe_key);
const { verifyToken } = require('../middlewares/auth');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Check car availability
router.post('/check-availability', async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.body;

    // Validate input
    if (!carId || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false,
        message: 'Car ID, start date, and end date are required' 
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid date range' 
      });
    }

    // Check for overlapping bookings
    const overlapping = await Booking.find({
      carId,
      status: { $in: ['pending', 'accepted', 'paid', 'completed'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    res.json({ 
      success: true,
      available: overlapping.length === 0,
      availableDates: {
        start: startDate,
        end: endDate
      }
    });

  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during availability check' 
    });
  }
});

// Create new booking
router.post('/', async (req, res) => {
  try {
    const { carId, startDate, endDate, driverName, driverPhone, totalPrice } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!carId || !startDate || !endDate || !driverName || !driverPhone || !totalPrice) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({ 
        success: false,
        message: 'End date must be after start date' 
      });
    }

    // Get car and verify seller
    const car = await cars.findById(carId).populate('sellerId');
    if (!car) {
      return res.status(404).json({ 
        success: false,
        message: 'Car not found' 
      });
    }

    // Check availability again (race condition protection)
    const overlapping = await Booking.find({
      carId,
      status: { $in: ['pending', 'accepted', 'paid', 'completed'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlapping.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Car not available for selected dates' 
      });
    }

    // Create new booking
    const booking = new Booking({
      carId,
      userId,
      sellerId: car.sellerId._id,
      startDate: start,
      endDate: end,
      driverName,
      driverPhone,
      totalPrice,
      status: 'pending'
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Booking request created',
      booking: {
        _id: booking._id,
        car: `${car.brand} ${car.name}`,
        dates: { start, end },
        status: booking.status,
        totalPrice
      }
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create booking' 
    });
  }
});

// Seller accepts booking and creates payment link
router.put('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user._id;

    // Get booking with car and user details
    const booking = await Booking.findById(id)
      .populate('carId')
      .populate('userId', 'email name');

    // Validate booking
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    // Authorization check
    if (booking.sellerId.toString() !== sellerId.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to accept this booking' 
      });
    }

    // Status validation
    if (booking.status !== 'pending') {
      return res.status(400).json({ 
        success: false,
        message: `Booking is already ${booking.status}` 
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${booking.carId.brand} ${booking.carId.name} Rental`,
            description: `${booking.startDate.toDateString()} to ${booking.endDate.toDateString()}`,
            images: [booking.carId.images[0]]
          },
          unit_amount: Math.round(booking.totalPrice * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `http://localhost:3000/dashboard/my-orders/${id}?payment=success`,
      cancel_url: `http://localhost:3000/dashboard/my-orders/${id}?payment=success`,
      metadata: {
        bookingId: id,
        userId: booking.userId._id.toString(),
        carId: booking.carId._id.toString()
      },
      customer_email: booking.userId.email,
      expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiration
    });

    // Update booking
    booking.status = 'accepted';
    booking.payment = {
      sessionId: session.id,
      url: session.url,
      expiresAt: new Date(session.expires_at * 1000),
      status: 'pending'
    };
    await booking.save();

    res.json({
      success: true,
      message: 'Booking accepted. Payment session created.',
      paymentUrl: session.url,
      expiresAt: booking.payment.expiresAt
    });

  } catch (error) {
    console.error('Accept booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log('Webhook event received:', event.type);
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Processing checkout.session.completed for booking:', session.metadata.bookingId);

    try {
      const booking = await Booking.findById(session.metadata.bookingId);
      if (!booking) {
        console.error(`Booking ${session.metadata.bookingId} not found`);
        return res.status(404).json({ received: true, error: 'Booking not found' });
      }

      if (booking.status !== 'paid') {
        booking.status = 'paid';
        booking.payment.status = 'completed';
        booking.payment.paidAt = new Date();
        booking.payment.amountPaid = session.amount_total / 100;
        await booking.save();
        console.log(`Booking ${session.metadata.bookingId} updated to paid`);
      } else {
        console.log(`Booking ${session.metadata.bookingId} already paid`);
      }

    } catch (dbError) {
      console.error('Webhook database error:', dbError);
      return res.status(500).json({ received: true, error: 'Database update failed' });
    }
  }

  res.json({ received: true });
});

// Get booking payment status
router.get('/:id/payment-status', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    console.log(`Checking payment status for booking ${id} by user ${userId}`);

    const booking = await Booking.findOne({
      _id: id,
      $or: [{ userId }, { sellerId: userId }]
    }).populate('sellerId');

    if (!booking) {
      console.log(`Booking ${id} not found for user ${userId}`);
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    console.log(`Booking ${id} status: ${booking.status}, walletUpdated: ${booking.walletUpdated}`);

    // If booking is paid and wallet hasn't been updated, add funds to seller's wallet
    if (booking.status === 'paid' && !booking.walletUpdated) {
      if (!booking.sellerId?._id) {
        console.error(`Booking ${id} missing sellerId`);
        return res.status(500).json({ 
          success: false,
          message: 'Invalid booking: missing seller information' 
        });
      }
      if (!booking.totalPrice || booking.totalPrice <= 0) {
        console.error(`Booking ${id} has invalid totalPrice: ${booking.totalPrice}`);
        return res.status(500).json({ 
          success: false,
          message: 'Invalid booking: missing or invalid total price' 
        });
      }

      const walletEntry = new SellerWallet({
        sellerId: booking.sellerId._id,
        amount: parseFloat(booking.totalPrice.toFixed(2)),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        source: 'order',
        orderId: booking._id
      });

      await walletEntry.save();
      booking.walletUpdated = true;
      await booking.save();

      console.log(`Added ${booking.totalPrice} to seller ${booking.sellerId._id} wallet for booking ${id}`);
    } else if (booking.status !== 'paid') {
      console.log(`Booking ${id} not paid, skipping wallet update`);
    } else if (booking.walletUpdated) {
      console.log(`Booking ${id} wallet already updated`);
    }

    res.json({
      success: true,
      bookingStatus: booking.status,
      paymentStatus: booking.payment?.status || 'unknown',
      paymentUrl: booking.payment?.url,
      expiresAt: booking.payment?.expiresAt
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to check payment status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Manually mark booking as paid (admin only)
router.put('/:id/mark-paid', async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    console.log(`Admin marking booking ${id} as paid`);

    const booking = await Booking.findById(id).populate('sellerId');
    if (!booking) {
      console.log(`Booking ${id} not found`);
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    if (booking.status === 'paid') {
      console.log(`Booking ${id} already paid`);
      return res.status(400).json({ 
        success: false, 
        message: 'Booking already paid' 
      });
    }

    booking.status = 'paid';
    booking.payment = booking.payment || {};
    booking.payment.status = 'completed';
    booking.payment.paidAt = new Date();
    booking.payment.amountPaid = booking.totalPrice;
    await booking.save();

    console.log(`Booking ${id} marked as paid`);

    res.json({ 
      success: true, 
      message: 'Booking marked as paid' 
    });

  } catch (error) {
    console.error('Mark paid error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark booking as paid',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user's bookings
router.get('/user', async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('carId', 'brand name images pricePerDay')
      .sort({ createdAt: -1 });

    console.log(`Fetched ${bookings.length} bookings for user ${req.user._id}`);

    res.json({ 
      success: true,
      bookings: bookings.map(b => ({
        _id: b._id,
        car: b.carId,
        dates: { start: b.startDate, end: b.endDate },
        status: b.status,
        totalPrice: b.totalPrice,
        paymentUrl: b.payment?.url
      }))
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get bookings' 
    });
  }
});

// Get seller's bookings
router.get('/seller', async (req, res) => {
  try {
    const bookings = await Booking.find({ sellerId: req.user._id })
      .populate('carId', 'brand name images pricePerDay')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true,
      bookings: bookings.map(b => ({
        _id: b._id,
        car: b.carId,
        user: b.userId,
        dates: { start: b.startDate, end: b.endDate },
        status: b.status,
        totalPrice: b.totalPrice
      }))
    });
  } catch (error) {
    console.error('Get seller bookings error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get bookings' 
    });
  }
});

// Admin can view all bookings
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

// Cancel booking
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find the booking
    const booking = await Booking.findById(id);

    // Check if booking exists
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    // Check if user is authorized (either the user who made the booking or admin)
    

    // Check if booking is in pending status
    if (booking.status !== 'pending') {
      return res.status(400).json({ 
        success: false,
        message: 'Booking can only be cancelled when in pending status' 
      });
    }

    // Update booking status to cancelled
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = userId;
    
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: {
        _id: booking._id,
        status: booking.status,
        cancelledAt: booking.cancelledAt
      }
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
});

module.exports = router;