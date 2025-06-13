const { ObjectId } = require('mongoose').Types;
const SellerWallet = require('../../models/sellerWallet');
const WithdrawalRequest = require('../../models/withdrowRequest');
const StripeAccount = require('../../models/stripeModel');
const stripe = require('stripe')(process.env.stripe_key);
const { responseReturn } = require('../../utiles/response');
const mongoose = require('mongoose');

class PaymentController {
  constructor() {
    // Bind all methods
    this.calculateAvailableBalance = this.calculateAvailableBalance.bind(this);
    this.getSellerBalance = this.getSellerBalance.bind(this);
    this.getSellerPaymentDetails = this.getSellerPaymentDetails.bind(this);
    this.createWithdrawal = this.createWithdrawal.bind(this);
    this.getWithdrawalHistory = this.getWithdrawalHistory.bind(this);
    this.getWithdrawalDetails = this.getWithdrawalDetails.bind(this);
    this.processWithdrawal = this.processWithdrawal.bind(this);
    this.getAllWithdrawals = this.getAllWithdrawals.bind(this);
    this.getWithdrawalStats = this.getWithdrawalStats.bind(this);
  }

  // =======================
  //     CORE METHODS
  // =======================

  async calculateAvailableBalance(sellerId) {
  try {
    // Validate sellerId format
    if (!ObjectId.isValid(sellerId)) {
      throw new Error('Invalid seller ID format');
    }

    const sellerObjectId = new ObjectId(sellerId);

    // Get data in parallel
    const [walletEntries, pendingWithdrawals] = await Promise.all([
      SellerWallet.find({ sellerId: sellerObjectId }).lean(),
      WithdrawalRequest.find({
        sellerId: sellerObjectId,
        status: { $in: ['pending', 'processing'] }
      }).lean()
    ]);

    // Calculate totals
    const total = walletEntries.reduce((sum, entry) => {
      if (typeof entry.amount !== 'number') {
        console.warn(`Invalid amount for entry ${entry._id}:`, entry.amount);
        return sum;
      }
      return sum + entry.amount;
    }, 0);

    const pending = pendingWithdrawals.reduce((sum, withdrawal) => {
      if (typeof withdrawal.amount !== 'number') {
        console.warn(`Invalid amount for withdrawal ${withdrawal._id}:`, withdrawal.amount);
        return sum;
      }
      return sum + withdrawal.amount;
    }, 0);

    const available = total - pending;

    return {
      total: parseFloat(total.toFixed(2)),
      available: parseFloat(available.toFixed(2)),
      pending: parseFloat(pending.toFixed(2)),
      currency: 'USD'
    };
  } catch (error) {
    console.error(`Balance calculation error for seller ${sellerId}:`, error);
    throw error;
  }
}

  // =======================
  //    SELLER ENDPOINTS
  // =======================

  async getSellerBalance(req, res) {
    try {
      const sellerId = req.user?.id || req.user?._id;

      if (!sellerId) {
        return responseReturn(res, 401, { 
          message: 'Authentication required - no seller ID found' 
        });
      }

      console.log('Fetching balance for seller:', sellerId);

      const balance = await this.calculateAvailableBalance(sellerId);

      return responseReturn(res, 200, {
        balance: {
          total: balance.total,
          available: balance.available,
          pending: balance.pending,
          currency: balance.currency
        }
      });
    } catch (error) {
      console.error('Get balance error:', error);
      return responseReturn(res, 500, {
        message: 'Failed to get balance',
        error: error.message
      });
    }
  }

  async getSellerPaymentDetails(req, res) {
    try {
      const sellerId = req.params.sellerId;
      const user = req.user;

      // Verify the requesting user has access
      if (!user || (user._id.toString() !== sellerId && user.role !== 'admin')) {
        return responseReturn(res, 403, {
          message: 'Unauthorized access to payment details'
        });
      }

      const [balance, requests] = await Promise.all([
        this.calculateAvailableBalance(sellerId),
        WithdrawalRequest.find({ sellerId }).sort({ createdAt: -1 }).lean()
      ]);

      return responseReturn(res, 200, {
        stats: balance,
        requests
      });
    } catch (error) {
      return responseReturn(res, 500, {
        message: 'Failed to fetch payment details',
        error: error.message
      });
    }
  }

  async createWithdrawal(req, res) {
    try {
      const { amount, paymentMethod, method, paymentDetails } = req.body;
      const sellerId = req.user?.id || req.user?._id;

      // Handle both paymentMethod and method for backward compatibility
      const withdrawalMethod = paymentMethod || method;

      if (!amount || isNaN(amount) || amount <= 0) {
        return responseReturn(res, 400, { message: 'Invalid amount' });
      }

      if (!withdrawalMethod) {
        return responseReturn(res, 400, { message: 'Payment method is required' });
      }

      const balance = await this.calculateAvailableBalance(sellerId);

      if (amount > balance.available) {
        return responseReturn(res, 400, {
          message: `Insufficient funds. Available: $${balance.available}`
        });
      }

      // Create withdrawal record
      const withdrawal = await WithdrawalRequest.create({
        sellerId,
        amount,
        paymentMethod: withdrawalMethod,
        paymentDetails: paymentDetails || {},
        status: 'pending'
      });

      return responseReturn(res, 201, {
        withdrawal,
        newBalance: {
          total: balance.total,
          available: balance.available - amount,
          pending: balance.pending + amount
        }
      });
    } catch (error) {
      return responseReturn(res, 500, {
        message: 'Withdrawal request failed',
        error: error.message
      });
    }
  }

  async getWithdrawalHistory(req, res) {
    try {
      const sellerId = req.user.id;
      const requests = await WithdrawalRequest.find({ sellerId })
        .sort({ createdAt: -1 })
        .lean();

      return responseReturn(res, 200, { requests });
    } catch (error) {
      return responseReturn(res, 500, {
        message: 'Failed to load history',
        error: error.message
      });
    }
  }

  // =======================
  //     ADMIN ENDPOINTS
  // =======================

  async getAllWithdrawals(req, res) {
    try {
      const { status, sellerId, page = 1, limit = 20, sort = '-createdAt' } = req.query;

      const filter = {};
      if (status) filter.status = status;
      if (sellerId) filter.sellerId = sellerId;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        populate: {
          path: 'sellerId',
          select: 'name email image'
        }
      };

      const result = await WithdrawalRequest.paginate(filter, options);

      return responseReturn(res, 200, {
        withdrawals: result.docs,
        total: result.totalDocs,
        pages: result.totalPages,
        page: result.page
      });
    } catch (error) {
      return responseReturn(res, 500, {
        message: 'Failed to fetch withdrawals',
        error: error.message
      });
    }
  }

  async getWithdrawalDetails(req, res) {
    try {
      const { withdrawalId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(withdrawalId)) {
        return responseReturn(res, 400, { message: 'Invalid withdrawal ID' });
      }

      const withdrawal = await WithdrawalRequest.findById(withdrawalId)
        .populate('sellerId', 'name email image')
        .lean();

      if (!withdrawal) {
        return responseReturn(res, 404, { message: 'Withdrawal not found' });
      }

      return responseReturn(res, 200, { withdrawal });
    } catch (error) {
      return responseReturn(res, 500, {
        message: 'Failed to fetch withdrawal details',
        error: error.message
      });
    }
  }

 async processWithdrawal(req, res) {
  try {
    const { withdrawalId } = req.params;
    const { action, adminNote } = req.body;

    // Basic validations
    if (!mongoose.Types.ObjectId.isValid(withdrawalId)) {
      return responseReturn(res, 400, { message: 'Invalid withdrawal ID' });
    }

    const withdrawal = await WithdrawalRequest.findById(withdrawalId);
    if (!withdrawal) {
      return responseReturn(res, 404, { message: 'Withdrawal not found' });
    }

    // Validate action
    if (!['approve', 'reject'].includes(action)) {
      return responseReturn(res, 400, { message: 'Invalid action' });
    }

    // Process based on action
    if (action === 'approve') {
      // Handle payment processing
     
     
      withdrawal.status = 'completed';
    } else {
      // Handle rejection
      withdrawal.status = 'rejected';
    }

    // Update withdrawal record
    withdrawal.processedAt = new Date();
    withdrawal.adminNote = adminNote;
    await withdrawal.save();

    return responseReturn(res, 200, {
      message: `Withdrawal ${action}d successfully`,
      withdrawal
    });

  } catch (error) {
    console.error('Process withdrawal error:', error);
    return responseReturn(res, 500, {
      message: 'Failed to process withdrawal',
      error: error.message
    });
  }
}

  async getWithdrawalStats(req, res) {
    try {
      const stats = await WithdrawalRequest.aggregate([
        {
          $group: {
            _id: null,
            totalCount: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            pendingAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
            },
            processingAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'processing'] }, '$amount', 0] }
            },
            completedAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
            },
            rejectedAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, '$amount', 0] }
            },
            failedAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, '$amount', 0] }
            },
            pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            processingCount: { $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] } },
            completedCount: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            rejectedCount: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
            failedCount: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
          }
        },
        {
          $project: {
            _id: 0,
            totalCount: 1,
            totalAmount: 1,
            pendingAmount: 1,
            processingAmount: 1,
            completedAmount: 1,
            rejectedAmount: 1,
            failedAmount: 1,
            pendingCount: 1,
            processingCount: 1,
            completedCount: 1,
            rejectedCount: 1,
            failedCount: 1
          }
        }
      ]);

      res.json({
        success: true,
        stats: stats[0] || {
          totalCount: 0,
          totalAmount: 0,
          pendingAmount: 0,
          processingAmount: 0,
          completedAmount: 0,
          rejectedAmount: 0,
          failedAmount: 0,
          pendingCount: 0,
          processingCount: 0,
          completedCount: 0,
          rejectedCount: 0,
          failedCount: 0
        }
      });
    } catch (error) {
      console.error('Get withdrawal stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch withdrawal stats',
        error: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack
        } : undefined
      });
    }
  }
}

module.exports = new PaymentController();