const { getStripeRevenue } = require('../../stripeServiceservices/stripeService');

exports.getAdminDashboardData = async (req, res) => {
  try {
    // Your existing dashboard data fetching
    const dashboardData = await fetchYourExistingDashboardData();
    
    // Get Stripe revenue for last 30 days
    const stripeData = await getStripeRevenue(30);
    
    // Calculate percentage change from previous period
    const previousStripeData = await getStripeRevenue(60); // Get 60 days to compare
    const currentPeriodRevenue = stripeData.totalRevenue;
    const previousPeriodRevenue = previousStripeData.totalRevenue - currentPeriodRevenue;
    const revenueChange = previousPeriodRevenue > 0 
      ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
      : 0;
    
    res.json({
      ...dashboardData,
      stripeData: {
        currentRevenue: currentPeriodRevenue,
        revenueChange: revenueChange.toFixed(1),
        recentTransactions: stripeData.transactions.slice(0, 5) // Show 5 most recent
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};