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

// module.exports = (sequelize, DataTypes) => {
//     const Order = sequelize.define("Order", {
//         id: {
//             type: DataTypes.INTEGER,
//             allowNull: false,
//             autoIncrement: true,
//             primaryKey: true
//         },
//         date: {
//             type: DataTypes.DATEONLY,
//             allowNull: false,
//             defaultValue: DataTypes.NOW
//         },
//         time: {
//             type: DataTypes.TIME,
//             allowNull: false,
//             defaultValue: DataTypes.NOW
//         }
//     }, {
//         tableName: "order",
//         timestamps: false
//     });

//     Order.associate = models => {
//         Order.belongsTo(models.Member, {
//             foreignKey: {
//                 allowNull: false,
//                 name: "member_id"
//             }
//         }),
//         Order.belongsToMany(models.Product, {
//             through: models.OrderProduct,
//             foreignKey: 'order_id',
//             timestamps: false
//         });
//     };

//     return Order;
// };