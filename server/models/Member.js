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

// module.exports = (sequelize, DataTypes) => {
//     const Member = sequelize.define("Member", {
//         id: {
//             type: DataTypes.INTEGER,
//             allowNull: false,
//             autoIncrement: true,
//             primaryKey: true
//         },
//         email: {
//             type: DataTypes.STRING(100),
//             allowNull: false,
//             unique: true
//         },
//         password: {
//             type: DataTypes.STRING(200),
//             allowNull: false,
//         },
//         first_name: {
//             type: DataTypes.STRING(100),
//             allowNull: false,
//         },
//         last_name: {
//             type: DataTypes.STRING(100)
//         },
//         gender: {
//             type: DataTypes.ENUM('MALE', 'FEMALE', 'RATHER_NOT_SAY')
//         },
//         photo: {
//             type: DataTypes.STRING(200)
//         },
//         date_of_birth: {
//             type: DataTypes.DATEONLY
//         },
//         phone_number: {
//             type: DataTypes.STRING(20)
//         },
//         street_address: {
//             type: DataTypes.STRING(1000)
//         },
//         apt_no: {
//             type: DataTypes.STRING(500)
//         },
//         city: {
//             type: DataTypes.STRING(50)
//         },
//         state: {
//             type: DataTypes.STRING(50)
//         },
//         country: {
//             type: DataTypes.STRING(200)
//         },
//         zipcode: {
//             type: DataTypes.STRING(10)
//         },
//         currency: {
//             type: DataTypes.STRING(10),
//             allowNull: false,
//             defaultValue: 'USD'
//         },
//         about: {
//             type: DataTypes.STRING(10000)
//         }
//     }, {
//         tableName: "member",
//         timestamps: false
//     });

//     Member.associate = models => {
//         Member.hasMany(models.Order, {
//             foreignKey: {
//                 allowNull: false,
//                 name: "member_id"
//             }
//         }),
//         Member.hasMany(models.Favourite, {
//             foreignKey: {
//                 allowNull: false,
//                 name: "member_id"
//             }
//         });
//     };

//     return Member;
// };