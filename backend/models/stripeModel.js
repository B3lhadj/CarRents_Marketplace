const { Schema, model } = require('mongoose');

const stripeAccountSchema = new Schema({
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
    unique: true
  },
  stripeId: {
    type: String,
    required: true,
    unique: true
  },
  details: Object,
  chargesEnabled: {
    type: Boolean,
    default: false
  },
  payoutsEnabled: {
    type: Boolean,
    default: false
  },
  requirements: Object,
  lastSynced: Date
}, {
  timestamps: true
});

module.exports = model('StripeAccount', stripeAccountSchema);