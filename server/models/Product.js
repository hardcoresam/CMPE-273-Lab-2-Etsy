module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define("Product", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        photo: {
            type: DataTypes.STRING(200)
        },
        name: {
            type: DataTypes.STRING(1000),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(10000)
        },
        price: {
            type: DataTypes.DECIMAL(10, 3).UNSIGNED,
            allowNull: false
        },
        quantity_available: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        }
    }, {
        tableName: "product",
        timestamps: false
    });

    Product.associate = models => {
        Product.belongsTo(models.Shop, {
            foreignKey: {
                allowNull: false,
                name: "shop_id"
            }
        }),
        Product.belongsTo(models.Category, {
            foreignKey: {
                allowNull: false,
                name: "category_id"
            }
        }),
        Product.belongsToMany(models.Order, {
            through: models.OrderProduct,
            foreignKey: 'product_id',
            timestamps: false
        }),
        Product.belongsToMany(models.Cart, {
            through: models.CartProduct,
            foreignKey: 'product_id',
            timestamps: false
        });
    };

    return Product;
};