const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    placed_on: {
        type: Date,
        required: true,
        default: Date.now
    },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    ordered_products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }]
}, {
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true },
    timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);