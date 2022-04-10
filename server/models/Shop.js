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

// module.exports = (sequelize, DataTypes) => {
//     const Shop = sequelize.define("Shop", {
//         id: {
//             type: DataTypes.INTEGER,
//             allowNull: false,
//             autoIncrement: true,
//             primaryKey: true
//         },
//         name: {
//             type: DataTypes.STRING(100),
//             allowNull: false,
//             unique: true
//         },
//         photo: {
//             type: DataTypes.STRING(200)
//         },
//         created_on: {
//             type: DataTypes.DATE,
//             allowNull: false,
//             defaultValue: DataTypes.NOW,
//             get() {
//                 return this.getDataValue('created_on').toLocaleString('en-GB', { timeZone: 'UTC' });
//             }
//         }
//     }, {
//         tableName: "shop",
//         timestamps: false
//     });

//     Shop.associate = models => {
//         Shop.belongsTo(models.Member, {
//             foreignKey: {
//                 allowNull: false,
//                 name: "owner_id"
//             }
//         }),
//         Shop.hasMany(models.Product, {
//             foreignKey: {
//                 allowNull: false,
//                 name: "shop_id"
//             }
//         });
//     };

//     return Shop;
// };