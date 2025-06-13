const Stripe = require('stripe');
const stripe = Stripe(process.env.stripe_key);

// Get current balance from Stripe
const getStripeBalance = async () => {
  try {
    const balance = await stripe.balance.retrieve();
    return {
      available: balance.available[0].amount / 100, // Convert to dollars
      pending: balance.pending[0].amount / 100
    };
  } catch (error) {
    console.error('Error fetching Stripe balance:', error);
    throw error;
  }
};

// Get revenue data for a specific time period
const getStripeRevenue = async (days = 30) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    const daysAgo = now - (days * 24 * 60 * 60);
    
    // Get all charges for the period
    const charges = await stripe.charges.list({
      created: { gte: daysAgo },
      limit: 100, // Adjust based on your expected volume
    });
    
    // Calculate total revenue
    const totalRevenue = charges.data.reduce((sum, charge) => sum + charge.amount, 0) / 100;
    
    // Calculate revenue by day for chart data
    const revenueByDay = {};
    charges.data.forEach(charge => {
      const date = new Date(charge.created * 1000).toISOString().split('T')[0];
      const amount = charge.amount / 100;
      
      revenueByDay[date] = (revenueByDay[date] || 0) + amount;
    });
    
    return {
      totalRevenue,
      transactions: charges.data,
      revenueByDay: Object.entries(revenueByDay).map(([date, amount]) => ({ date, amount }))
    };
  } catch (error) {
    console.error('Error fetching Stripe revenue:', error);
    throw error;
  }
};

module.exports = {
  getStripeBalance,
  getStripeRevenue
};