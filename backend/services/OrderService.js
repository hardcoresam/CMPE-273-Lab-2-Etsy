const Member = require("../models/Member");
const Order = require("../models/Order");
const actions = require('../../util/kafkaActions.json')

exports.handle_request = (payload, callback) => {
    const { action } = payload;
    switch (action) {
        case actions.PLACE_ORDER:
            placeOrder(payload, callback);
            break;
        case actions.GET_ALL_ORDERS:
            getAllOrders(payload, callback);
            break;
    }
};

const placeOrder = async (payload, callback) => {
    //Check if address is present for this user before placing order
    const member = await Member.findById(payload.user_id, 'cart address').populate('cart.product');
    if (!member.address || !member.address.street_address) {
        return callback({
            error: "You have no saved address. Please go to your profile and save your address before placing an order."
        }, null);
    }

    if (member.cart.length === 0) {
        return callback({ error: "Invalid cart info. Cannot place order." }, null);
    }

    //Check if products are available for the selected quantity before ordering
    for (const cartInfo of member.cart) {
        if (cartInfo.quantity > cartInfo.product.quantity_available) {
            return callback({
                error: `${cartInfo.product.name} has ${cartInfo.product.quantity_available} items in stock. Please modify your quantity before placing an order`
            }, null);
        }
    }

    const newOrder = new Order({ member: payload.user_id, ordered_products: [] });

    member.cart.forEach(async (cartInfo) => {
        newOrder.ordered_products.push({
            product: cartInfo.product.id,
            quantity: cartInfo.quantity,
            price: cartInfo.product.price,
            gift_packing: cartInfo.gift_packing,
            note_to_seller: cartInfo.note_to_seller
        });
        //Changing the available quantity and no_of_sales for the products
        await Product.findByIdAndUpdate({ _id: cartInfo.product.id }, {
            quantity_available: cartInfo.product.quantity_available - cartInfo.quantity,
            $inc: {
                no_of_sales: cartInfo.quantity
            }
        });
    });
    await newOrder.save();

    //Deleting all the products from cart once order is placed successfully
    member.cart = [];
    await member.save();
    return callback(null, { message: "Order placed successfully" });
}

const getAllOrders = async (payload, callback) => {
    const { page, limit } = payload.query;
    let orders = await Order.find({
        member: payload.user_id
    }).populate({
        path: 'ordered_products.product',
        populate: 'shop'
    });

    const totalOrdersCount = orders.length;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    orders = orders.slice(startIndex, endIndex);

    const result = {
        orders: orders,
        totalOrdersCount: totalOrdersCount
    }
    return callback(null, result);
}