module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define("Order", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        time: {
            type: DataTypes.TIME,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: "order",
        timestamps: false
    });

    Order.associate = models => {
        Order.belongsTo(models.Member, {
            foreignKey: {
                allowNull: false,
                name: "member_id"
            }
        }),
        Order.belongsToMany(models.Product, {
            through: models.OrderProduct, 
            foreignKey: 'order_id',
            timestamps: false
        });
    };

    return Order;
};