module.exports = (sequelize, DataTypes) => {
    const Cart = sequelize.define("Cart", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        }
    }, {
        tableName: "cart",
        timestamps: false
    });

    Cart.associate = models => {
        Cart.belongsTo(models.Member, {
            foreignKey: {
                allowNull: false,
                name: "member_id"
            }
        }),
        Cart.belongsToMany(models.Product, {
            through: models.CartProduct,
            foreignKey: 'cart_id',
            timestamps: false
        });
    };

    return Cart;
};