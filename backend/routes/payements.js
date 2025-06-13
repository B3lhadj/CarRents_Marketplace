const express = require('express');
const router = express.Router();
const Booking = require('../models/bookingModel');
const stripe = require('stripe')(process.env.stripe_key);
const { verifyToken } = require('../middlewares/auth');

// POST /api/payments/initiate
router.post('/initiate', verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId).populate('carId');
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    if (booking.status !== 'accepted') {
      return res.status(400).json({ 
        success: false,
        message: 'Booking must be accepted before payment' 
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${booking.carId.brand} ${booking.carId.model} Rental`,
            description: `Booking #${booking._id.toString().slice(-6)}`,
            images: [booking.carId.images[0]],
          },
          unit_amount: Math.round(booking.totalPrice * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.user_panel_production_url}/dashboard/my-orders?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/bookings/${bookingId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        bookingId: bookingId.toString(),
        userId: userId.toString(),
        carId: booking.carId._id.toString()
      },
      customer_email: req.user.email,
    });

    // Store session ID but don't wait for webhook
    booking.payment = {
      sessionId: session.id,
      status: 'completed',
      amount: booking.totalPrice,
      currency: 'usd'
    };
    booking.status= "paid",
    await booking.save();

    res.json({ 
      success: true,
      url: session.url
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment session'
    });
  }
});

// Verify payment status manually
// GET /api/payments/verify/:sessionId
// Enhanced verification endpoint
router.get('/verify/:sessionId', verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    // 1. First verify the Stripe session exists
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Stripe session:', session.id, 'Status:', session.payment_status);

    // 2. Find booking by either:
    //    - Direct sessionId match in payment object
    //    - Or via metadata bookingId (backup lookup)
    let booking = await Booking.findOne({
      $or: [
        { 'payment.sessionId': sessionId },
        { _id: session.metadata?.bookingId }
      ],
      userId: userId
    });

    if (!booking) {
      console.error('No booking found for session:', sessionId);
      return res.status(404).json({
        success: false,
        message: 'Booking not found for this session'
      });
    }

    // 3. Update payment status if paid
    if (session.payment_status === 'paid' && booking.status !== 'paid') {
      booking.status = 'paid';
      booking.payment = {
        ...booking.payment,
        status: 'completed',
        paidAt: new Date(),
        amountReceived: session.amount_total / 100
      };
      await booking.save();
      console.log('Updated booking to paid status:', booking._id);
    }

    res.json({
      success: true,
      paid: session.payment_status === 'paid',
      booking: {
        _id: booking._id,
        status: booking.status,
        payment: booking.payment
      }
    });

  } catch (error) {
    console.error('Payment verification failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;