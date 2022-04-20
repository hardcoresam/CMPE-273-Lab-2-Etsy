const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        sparse: true
    },
    photo: String,
    created_on: {
        type: Date,
        required: true,
        default: Date.now,
        get: (created_on) => created_on.toLocaleString('en-GB', { timeZone: 'UTC' })
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' }
}, {
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true },
    timestamps: true
});

shopSchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'shop'
});

module.exports = mongoose.model("Shop", shopSchema);