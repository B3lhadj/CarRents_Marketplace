const { Schema, model } = require('mongoose');

const customerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Recommended to add unique constraint
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    method: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        validate: {
            validator: function(v) {
                // Simple phone number validation (adjust as needed)
                return /\d{10,15}/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: {
            type: String,
            default: 'USA' // Set default country as needed
        }
    }
}, { 
    timestamps: true 
});

module.exports = model('customers', customerSchema);