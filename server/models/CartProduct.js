module.exports = (sequelize, DataTypes) => {
    const CartProduct = sequelize.define("CartProduct", {
        quantity: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        }
    }, {
        tableName: "cart_product",
        timestamps: false
    });

    return CartProduct;
};