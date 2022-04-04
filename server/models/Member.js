module.exports = (sequelize, DataTypes) => {
    const Member = sequelize.define("Member", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        first_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING(100)
        },
        gender: {
            type: DataTypes.ENUM('MALE', 'FEMALE', 'RATHER_NOT_SAY')
        },
        photo: {
            type: DataTypes.STRING(200)
        },
        date_of_birth: {
            type: DataTypes.DATEONLY
        },
        phone_number: {
            type: DataTypes.STRING(20)
        },
        street_address: {
            type: DataTypes.STRING(1000)
        },
        apt_no: {
            type: DataTypes.STRING(500)
        },
        city: {
            type: DataTypes.STRING(50)
        },
        state: {
            type: DataTypes.STRING(50)
        },
        country: {
            type: DataTypes.STRING(200)
        },
        zipcode: {
            type: DataTypes.STRING(10)
        },
        currency: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'USD'
        },
        about: {
            type: DataTypes.STRING(10000)
        }
    }, {
        tableName: "member",
        timestamps: false
    });

    Member.associate = models => {
        Member.hasMany(models.Order, {
            foreignKey: {
                allowNull: false,
                name: "member_id"
            }
        }),
        Member.hasMany(models.Favourite, {
            foreignKey: {
                allowNull: false,
                name: "member_id"
            }
        });
    };

    return Member;
};