const { Schema, model } = require('mongoose');

const sellerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  phone: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'seller',
  },
  status: {
    type: String,
    default: 'pending',
  },
  payment: {
    type: String,
    default: 'inactive',
  },
  method: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: '',
  },
  shopInfo: {
    type: {
      agencyName: { type: String, required: true },
      address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
      },
      taxId: { type: String, required: true },
      businessLicense: { type: String, required: true },
      description: { type: String },
      fleetSize: { type: Number, default: 0 },
      yearFounded: { type: Number },
      contactPerson: { type: String },
      website: { type: String },
    },
    required: true,
  },
  stripeCustomerId: {
    type: String,
  },
  stripeSubscriptionId: {
    type: String,
  },
  subscription: {
    plan: { type: String, default: 'Free Trial' },
    isTrial: { type: Boolean, default: true },
    status: { type: String, default: 'active' }, // active | expired | inactive
    carLimit: { type: Number, default: 2 },
    startDate: { type: Date },
    endDate: { type: Date },
  },
}, {
  timestamps: true,
});

// Indexes
sellerSchema.index({
  name: 'text',
  email: 'text',
  'shopInfo.agencyName': 'text',
  'shopInfo.address.city': 'text',
}, {
  weights: {
    name: 5,
    email: 4,
    'shopInfo.agencyName': 6,
    'shopInfo.address.city': 3,
  },
});

sellerSchema.index({ email: 1 }, { unique: true });

module.exports = model('sellers', sellerSchema);