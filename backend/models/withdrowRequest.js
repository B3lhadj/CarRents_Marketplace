const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const withdrawalRequestSchema = new Schema({
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'sellers',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected', 'failed'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'bank_transfer'],
    required: true
  },
  paymentDetails: {
    type: Object,
    required: false
  },
  processedAt: {
    type: Date
  },
  adminNote: {
    type: String
  },
  failureReason: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Add pagination plugin
withdrawalRequestSchema.plugin(mongoosePaginate);

// Indexes for faster queries
withdrawalRequestSchema.index({ sellerId: 1, status: 1 });
withdrawalRequestSchema.index({ createdAt: -1 });

module.exports = model('WithdrawalRequest', withdrawalRequestSchema);