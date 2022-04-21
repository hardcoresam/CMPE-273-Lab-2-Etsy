const Shop = require("../models/Shop");
const actions = require('../../util/kafkaActions.json')

exports.handle_request = (payload, callback) => {
    const { action } = payload;
    switch (action) {
        case actions.GET_SHOP:
            getShop(payload, callback);
            break;
        case actions.GET_SHOP_BY_ID:
            getShopById(payload, callback);
            break;
        case actions.CHECK_SHOP_IF_AVAILABLE:
            checkShopNameAvailability(payload, callback);
            break;
        case actions.CREATE_SHOP:
            createShop(payload, callback);
            break;
        case actions.CHANGE_SHOP_IMAGE:
            changeShopImage(payload, callback);
            break;
    }
};

const getShop = async (payload, callback) => {
    const shop = await Shop.findOne({ owner: payload.user_id });
    return callback(null, shop);
}

const getShopById = async (payload, callback) => {
    const shopId = payload.params.shopId;
    if (shopId.length !== 24) {
        return callback({ error: "Invalid shop id specified" }, null);
    }

    const shop = await Shop.findById(shopId).populate('owner', 'first_name photo phone_number').populate('products');
    if (shop === null) {
        return callback({ error: "Invalid shop id specified" }, null);
    }

    let shopTotalSales = 0;
    if (shop.products && shop.products.length > 0) {
        shop.products.forEach(product => {
            shopTotalSales = shopTotalSales + product.no_of_sales;
        });
    }

    const result = {
        shop: shop,
        is_owner: shop.owner.equals(payload.user_id),
        shop_total_sales: shopTotalSales
    }
    return callback(null, result);
}

const checkShopNameAvailability = async (payload, callback) => {
    const shop = await Shop.findOne({ name: payload.shopName });
    return callback(null, { available: shop === null });
}

const createShop = async (payload, callback) => {
    const newShop = await new Shop({
        name: payload.shopName,
        owner: payload.user_id
    }).save();
    return callback(null, { newShopId: newShop.id });
}

const changeShopImage = async (payload, callback) => {
    await Shop.findByIdAndUpdate({ _id: payload.shopId }, { photo: payload.shopImage });
    return callback(null, { message: 'Shop Image edited successfully' });
}