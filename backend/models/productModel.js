const mongoose = require('mongoose');
const { Schema } = mongoose;

const carSchema = new Schema({
    sellerId: { 
        type: Schema.Types.ObjectId, 
        required: true, 
        ref: 'sellers' 
    },
    name: { 
        type: String, 
        required: true 
    },
    slug: { 
        type: String, 
        required: true, 
        unique: true 
    },
    brand: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        enum: ['Sedan', 'SUV', 'Sports Car', 'Coupe', 'Hatchback', 'Convertible', 'Minivan', 'Pickup Truck', 'Luxury', 'Electric'],
        required: true 
    },
    description: { 
        type: String 
    },
    images: { 
        type: [String],
        required: true
    },
    pricePerDay: { 
        type: Number, 
        required: true 
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    shopName: {
        type: String
    },
    year: {
        type: Number,
        required: true,
        min: 1900,
        max: new Date().getFullYear() + 1
    },
    mileage: {
        type: Number,
        required: true,
        min: 0
    },
    transmission: { 
        type: String, 
        enum: ['Automatic', 'Manual', 'CVT', 'Semi-Automatic'],
        required: true 
    },
    fuelType: { 
        type: String, 
        enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'],
        required: true 
    },
    location: {
        type: String,
        required: true
    },
    ville: { 
        type: String, 
        required: true,
        index: true
    },
    pays: { 
        type: String, 
        required: true,
        index: true
    },
    seats: { 
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    color: {
        type: String,
        required: true
    },
    engine: {
        type: String,
        required: true
    },
    features: {
        type: [String],
        default: []
    },
    available: { 
        type: Boolean, 
        default: true 
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewsCount: {
        type: Number,
        default: 0
    },
    bookedDates: [{
        startDate: { 
            type: Date, 
            required: true 
        },
        endDate: { 
            type: Date, 
            required: true 
        },
        orderId: {
            type: Schema.Types.ObjectId,
            ref: 'CarOrder'
        }
    }]
}, { 
    timestamps: true 
});

// Add text index for search functionality
carSchema.index({
    name: 'text',
    brand: 'text',
    description: 'text',
    ville: 'text',
    pays: 'text'
});

module.exports = mongoose.model('cars', carSchema); 