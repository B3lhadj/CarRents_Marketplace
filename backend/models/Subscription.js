const { Schema } = require('mongoose');

const subscriptionSchema = new Schema({
    plan: {
        type: String,
        default: 'Free Trial', // Free Trial | Starter | Pro | Elite
    },
    status: {
        type: String,
        default: 'trial', // trial | active | expired
    },
    isTrial: {
        type: Boolean,
        default: true,
    },
    carLimit: {
        type: Number,
        default: 2, // Default for free trial
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    endDate: {
        type: Date,
        default: () => {
            const date = new Date();
            date.setDate(date.getDate() + 7); // Free trial: 7 days
            return date;
        },
    },
}, { _id: false }); // Disable _id since it's embedded

module.exports = subscriptionSchema;
