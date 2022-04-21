const Category = require("../models/Category");
const actions = require('../../util/kafkaActions.json')

exports.handle_request = (payload, callback) => {
    const { action } = payload;
    switch (action) {
        case actions.CREATE_CATEGORY:
            createCategory(payload, callback);
            break;
        case actions.GET_ALL_CATEGORIES:
            getAllCategories(payload, callback);
            break;
    }
};

const createCategory = async (payload, callback) => {
    const category = await new Category({
        name: payload.categoryName
    }).save();
    return callback(null, category);
}

const getAllCategories = async (payload, callback) => {
    const categories = await Category.find({}).sort('_id');
    return callback(null, categories);
}