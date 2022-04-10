const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    photo: String,
    description: String,
    price: {
        type: Number,
        required: true
    },
    quantity_available: {
        type: Number,
        required: true
    },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

module.exports = mongoose.model("Product", productSchema);