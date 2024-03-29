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
    date_of_birth: {
        type: Date,
        get: (date_of_birth) => {
            if (date_of_birth) {
                return date_of_birth.toLocaleDateString('en-CA');
            }
            return date_of_birth;
        }
    },
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
        },
        gift_packing: Boolean,
        note_to_seller: String
    }]
}, {
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true },
    timestamps: true
});

module.exports = mongoose.model("Member", memberSchema);