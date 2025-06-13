// services/balanceService.js
const { ObjectId } = require('mongoose').Types;
const SellerWallet = require('../models/sellerWallet');
const WithdrawalRequest = require('../models/withdrowRequest');

async function calculateAvailableBalance(sellerId) {
    try {
        // Validate sellerId
        if (!ObjectId.isValid(sellerId)) {
            throw new Error('Invalid seller ID format');
        }

        const sellerObjectId = new ObjectId(sellerId);

        // Get data in parallel
        const [walletEntries, pendingWithdrawals] = await Promise.all([
            SellerWallet.find({ sellerId: sellerObjectId }),
            WithdrawalRequest.find({
                sellerId: sellerObjectId,
            })
        ]);

        // Calculate totals
        const total = walletEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
        const pending = pendingWithdrawals.reduce((sum, req) => sum + (req.amount || 0), 0);
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

module.exports = {
    calculateAvailableBalance
};