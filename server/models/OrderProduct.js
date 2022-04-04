module.exports = (sequelize, DataTypes) => {
    const OrderProduct = sequelize.define("OrderProduct", {
        quantity: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        price: {
            type: DataTypes.DECIMAL(10, 3).UNSIGNED,
            allowNull: false
        }
    }, {
        tableName: "order_product",
        timestamps: false
    });

    return OrderProduct;
};