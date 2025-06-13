const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sellers = require('../models/sellerModel'); // Adjust path to your sellers model

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { sellerId, plan, carLimit } = session.metadata;
      const subscriptionId = session.subscription;

      if (!sellerId || !plan || !carLimit || !subscriptionId) {
        console.error('Missing metadata or subscription ID:', session.metadata, subscriptionId);
        return res.status(400).send('Webhook Error: Missing metadata or subscription ID');
      }

      // Find and update seller
      const seller = await sellers.findById(sellerId);
      if (!seller) {
        console.error('Seller not found:', sellerId);
        return res.status(404).send('Webhook Error: Seller not found');
      }

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1); // Assume monthly billing

      // Update seller's subscription
      await sellers.findByIdAndUpdate(sellerId, {
        stripeSubscriptionId: subscriptionId,
        subscription: {
          plan,
          isTrial: false,
          status: 'active',
          carLimit: parseInt(carLimit, 10),
          startDate,
          endDate,
        },
      }, { new: true });

      console.log(`Updated seller ${sellerId} with plan ${plan}, carLimit ${carLimit}, subscriptionId ${subscriptionId}`);
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).send(`Webhook Error: ${error.message}`);
  }

  res.json({ received: true });
});

module.exports = router;