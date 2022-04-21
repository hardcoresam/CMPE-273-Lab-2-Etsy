const Member = require("../models/Member");
const actions = require('../../util/kafkaActions.json')

exports.handle_request = (payload, callback) => {
    const { action } = payload;
    switch (action) {
        case actions.ADD_TO_CART:
            addToCart(payload, callback);
            break;
        case actions.REMOVE_FROM_CART:
            removeFromCart(payload, callback);
            break;
        case actions.MODIFY_CART:
            modifyCart(payload, callback);
            break;
        case actions.GET_CART_DETAILS:
            getCartDetails(payload, callback);
            break;
    }
};

const addToCart = async (payload, callback) => {
    const member = await Member.findById(payload.user_id, 'cart');
    let cartProductInfo;
    for (const cartProduct of member.cart) {
        if (cartProduct.product.equals(payload.productId)) {
            cartProductInfo = cartProduct;
            break;
        }
    }
    if (cartProductInfo) {
        //Product already present in cart. Update quantity
        cartProductInfo.quantity = cartProductInfo.quantity + parseInt(payload.quantity);
        await member.save();
    } else {
        //Add new product to cart
        await Member.findByIdAndUpdate({ _id: payload.user_id }, { $push: { cart: { product: payload.productId, quantity: payload.quantity } } });
    }
    return callback(null, { message: "Modified cart successfully" });
}

const removeFromCart = async (payload, callback) => {
    await Member.updateOne({ _id: payload.user_id }, { "$pull": { "cart": { "product": payload.productId } } });

    const cartInfo = await Member.findById(payload.user_id, 'cart').populate({
        path: 'cart.product',
        populate: 'shop'
    });
    return callback(null, cartInfo);
}

const modifyCart = async (payload, callback) => {
    let updateType = 'cart.$.' + payload.updateType;
    const updatedCartInfo = await Member.findOneAndUpdate({
        _id: payload.user_id,
        cart: { '$elemMatch': { product: payload.productId } }
    }, {
        $set: { [updateType]: payload.updateValue }
    }, {
        "fields": { "cart": 1 },
        new: true
    }).populate({
        path: 'cart.product',
        populate: 'shop'
    });
    return callback(null, updatedCartInfo);
}

const getCartDetails = async (payload, callback) => {
    const cartInfo = await Member.findById(payload.user_id, 'cart').populate({
        path: 'cart.product',
        populate: 'shop'
    });
    return callback(null, cartInfo);
}