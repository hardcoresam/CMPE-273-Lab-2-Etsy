const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);

// module.exports = (sequelize, DataTypes) => {
//     const Category = sequelize.define("Category", {
//         id: {
//             type: DataTypes.INTEGER,
//             allowNull: false,
//             autoIncrement: true,
//             primaryKey: true
//         },
//         name: {
//             type: DataTypes.STRING(200),
//             allowNull: false,
//             unique: true
//         }
//     }, {
//         tableName: "category",
//         timestamps: false
//     });
    
//     return Category;
// };