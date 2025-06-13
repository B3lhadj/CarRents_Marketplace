const { Schema, model } = require('mongoose');

const carOrderSchema = new Schema({
    // Order Information
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    referenceNumber: {
        type: String,
        unique: true
    },

    // User Information
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    customerPhone: {
        type: String,
        required: true
    },

    // Car Information
    carId: {
        type: Schema.Types.ObjectId,
        ref: 'Car',
        required: true
    },
    carMake: {
        type: String,
        required: true
    },
    carModel: {
        type: String,
        required: true
    },
    carType: {
        type: String,
        required: true
    },
    carImage: {
        type: String
    },

    // Rental Period
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totalDays: {
        type: Number,
        required: true
    },

    // Pricing
    dailyRate: {
        type: Number,
        required: true
    },
    subTotal: {
        type: Number,
        required: true
    },
    taxes: {
        type: Number,
        default: 0
    },
    insuranceFee: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },

    // Payment Information
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'paypal', 'bank_transfer', 'cash'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    transactionId: {
        type: String
    },

    // Rental Status
    rentalStatus: {
        type: String,
        enum: ['reserved', 'active', 'completed', 'cancelled'],
        default: 'reserved'
    },
    pickupLocation: {
        type: String,
        required: true
    },
    dropoffLocation: {
        type: String,
        required: true
    },

    // Additional Services
    additionalServices: [{
        name: String,
        price: Number,
        quantity: Number
    }],

    // System Fields
    notes: {
        type: String
    },
    cancellationReason: {
        type: String
    },
    cancellationDate: {
        type: Date
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
carOrderSchema.index({ carId: 1 });
carOrderSchema.index({ customerId: 1 });
carOrderSchema.index({ startDate: 1, endDate: 1 });
carOrderSchema.index({ rentalStatus: 1 });

// Virtuals
carOrderSchema.virtual('isActive').get(function() {
    const now = new Date();
    return this.startDate <= now && this.endDate >= now && this.rentalStatus === 'active';
});

// Hooks
carOrderSchema.pre('save', function(next) {
    if (!this.referenceNumber) {
        this.referenceNumber = `CAR-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    }
    
    if (this.isModified('startDate') || this.isModified('endDate')) {
        this.totalDays = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24)) + 1;
    }
    
    next();
});

// Static Methods
carOrderSchema.statics.checkAvailability = async function(carId, startDate, endDate, excludeOrderId = null) {
    const query = {
        carId,
        rentalStatus: { $nin: ['cancelled'] },
        $or: [
            { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
            { startDate: { $gte: startDate }, endDate: { $lte: endDate } }
        ]
    };

    if (excludeOrderId) {
        query._id = { $ne: excludeOrderId };
    }

    const conflictingOrders = await this.find(query);
    return conflictingOrders.length === 0;
};

module.exports = model('CarOrder', carOrderSchema);