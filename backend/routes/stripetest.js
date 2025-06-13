const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_KEY);
const sellers = require('../models/sellerModel');
const StripeAccount = require('../models/stripeModel'); // Import the new model

router.post('/connect-stripe', async (req, res) => {
  try {
    const { sellerId } = req.body;
    
    // 1. Validate input
    if (!sellerId) {
      return res.status(400).json({ 
        success: false,
        message: 'Seller ID is required' 
      });
    }

    // 2. Find seller
    const seller = await sellers.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ 
        success: false,
        message: 'Seller not found' 
      });
    }

    // 3. Check for existing Stripe account
    let stripeAccount = await StripeAccount.findOne({ sellerId });
    if (stripeAccount) {
      const account = await stripe.accounts.retrieve(stripeAccount.stripeId);
      return res.json({
        success: true,
        message: 'Stripe account already exists',
        accountStatus: account.details_submitted ? 'active' : 'pending',
        onboardingUrl: stripeAccount.onboardingUrl
      });
    }

    // 4. Create Stripe Express account
    const account = await stripe.accounts.create({
      type: 'express',
      email: seller.email,
      business_type: 'individual',
      metadata: { sellerId: seller._id.toString() },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      }
    });

    // 5. Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}/seller/payouts?reauth=true`,
      return_url: `${process.env.FRONTEND_URL}/seller/payouts?success=true`,
      type: 'account_onboarding'
    });

    // 6. Create StripeAccount record
    stripeAccount = new StripeAccount({
      sellerId: seller._id,
      stripeId: account.id,
      details: {
        email: seller.email,
        business_type: 'individual'
      },
      onboardingUrl: accountLink.url
    });
    await stripeAccount.save();

    // 7. Update seller record
    await sellers.findByIdAndUpdate(sellerId, {
      payment: 'pending_verification'
    });

    // 8. Return success response
    res.json({
      success: true,
      onboardingUrl: accountLink.url,
      stripeAccountId: account.id,
      message: 'Stripe account created successfully'
    });

  } catch (error) {
    console.error('STRIPE CONNECTION ERROR:', {
      message: error.message,
      type: error.type,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    res.status(500).json({
      success: false,
      message: error.type === 'StripeInvalidRequestError' 
        ? error.message 
        : 'Failed to connect Stripe account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add webhook handler for account updates
router.post('/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'account.updated') {
    const account = event.data.object;
    
    await StripeAccount.findOneAndUpdate(
      { stripeId: account.id },
      {
        details: account,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        requirements: account.requirements,
        lastSynced: new Date()
      }
    );
  }

  res.json({received: true});
});

module.exports = router;