const { Schema, model } = require('mongoose');

const bookingSchema = new Schema({
  carId: {
    type: Schema.Types.ObjectId,
    ref: 'cars',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'customers',
    required: true
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'sellers',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  driverName: {
    type: String,
    required: true
  },
  driverPhone: {
    type: String,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'paid', 'completed', 'cancelled'],
    default: 'pending'
  },
  payment: {
    sessionId: String,
    url: String,
    expiresAt: Date,
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    },
    paidAt: Date,
    amountPaid: Number
  },
  cancelledAt: Date,
  cancelledBy: {
    type: Schema.Types.ObjectId,
    ref: 'customers'
  },
  walletUpdated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = model('Booking', bookingSchema);