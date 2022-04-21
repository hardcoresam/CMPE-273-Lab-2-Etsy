const Product = require("../models/Product");
const actions = require('../../util/kafkaActions.json')

exports.handle_request = (payload, callback) => {
    const { action } = payload;
    switch (action) {
        case actions.CREATE_PRODUCT:
            createProduct(payload, callback);
            break;
        case actions.EDIT_PRODUCT:
            editProduct(payload, callback);
            break;
        case actions.GET_PRODUCT_BY_ID:
            getProductById(payload, callback);
            break;
        case actions.GET_ALL_PRODUCTS:
            getAllProducts(payload, callback);
            break;
        case actions.FILTER_PRODUCTS:
            filterProducts(payload, callback);
            break;
    }
};

const createProduct = async (payload, callback) => {
    const newProduct = await new Product({
        name: payload.name,
        photo: payload.photo,
        category: payload.category,
        description: payload.description,
        shop: payload.shopId,
        price: payload.price,
        quantity_available: payload.quantityAvailable
    }).save();
    return callback(null, newProduct);
}

const editProduct = async (payload, callback) => {
    const productId = payload.params.productId;
    if (productId.length !== 24) {
        return callback({ error: "Invalid product id specified" }, null);
    }

    const product = await Product.findById(productId);
    if (product === null) {
        return callback({ error: "Invalid product id specified" }, null);
    }

    product.name = payload.name;
    product.photo = payload.photo;
    product.category = payload.category;
    product.description = payload.description;
    product.price = payload.price;
    product.quantity_available = payload.quantityAvailable;
    await product.save();
    return callback(null, { message: 'Product update successfull' });
}

const getProductById = async (payload, callback) => {
    const productId = payload.params.productId;
    if (productId.length !== 24) {
        return callback({ error: "Invalid product id specified" }, null);
    }

    const product = await Product.findById(productId).populate('shop').populate('category');
    if (product === null) {
        return callback({ error: "Invalid product id specified" }, null);
    }

    const loggedInMember = await Member.findById(payload.user_id).populate({
        path: 'favouriteProducts', match: { _id: { $eq: productId } }
    });
    const result = {
        product: product,
        is_favourited: loggedInMember.favouriteProducts.length !== 0,
    }
    return callback(null, result);
}

const getAllProducts = async (payload, callback) => {
    const products = await Product.find({});
    return callback(null, products);
}

const filterProducts = async (payload, callback) => {
    let searchText = '.*' + payload.searchedText + '.*';
    let findConditions = {
        name: {
            $regex: searchText,
            $options: 'i'
        }
    };

    if (payload.excludeOutOfStockSql) {
        findConditions.quantity_available = {
            $gt: 0
        };
    }
    if (payload.minPrice) {
        findConditions.price = {
            $gte: payload.minPrice
        }
    }
    if (payload.maxPrice) {
        if (findConditions.price) {
            findConditions.price.$lte = payload.maxPrice
        } else {
            findConditions.price = {
                $lte: payload.maxPrice
            }
        }
    }

    const filteredProducts = await Product.find(findConditions).sort(payload.sortBy);
    return callback(null, filteredProducts);
}