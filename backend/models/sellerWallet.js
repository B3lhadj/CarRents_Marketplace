const { Schema, model } = require('mongoose');

const sellerWalletSchema = new Schema({
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
    set: v => parseFloat(v.toFixed(2))
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true,
    min: 2020
  },
  source: {
    type: String,
    enum: ['order', 'refund', 'adjustment'],
    required: true
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = model('SellerWallet', sellerWalletSchema);