const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: String,
    gender: {
        type: String,
        enum: ['MALE', 'FEMALE', 'RATHER_NOT_SAY']
    },
    photo: String,
    date_of_birth: Date,
    phone_number: String,
    address: {
        street_address: String,
        apt_no: String,
        city: String,
        state: String,
        country: String,
        zipcode: String
    },
    currency: {
        type: String,
        required: true,
        default: 'USD'
    },
    about: String,
    favouriteProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    cart: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: {
            type: Number,
            required: true
        }
    }]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

module.exports = mongoose.model("Member", memberSchema);