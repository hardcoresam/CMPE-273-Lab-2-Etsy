const Member = require("../models/Member");
const actions = require('../../util/kafkaActions.json')

exports.handle_request = (payload, callback) => {
    const { action } = payload;
    switch (action) {
        case actions.GET_ALL_FAVOURITES:
            getAllFavourites(payload, callback);
            break;
        case actions.ADD_OR_REMOVE_FAVOURITE:
            modifyFavourite(payload, callback);
            break;
        case actions.GET_FAVOURITES_FOR_MEMBER:
            getFavouritesForMember(payload, callback);
            break;
    }
};

const getAllFavourites = async (payload, callback) => {
    const memberInfo = await Member.findById(payload.user_id, 'favouriteProducts');
    return callback(null, memberInfo.favouriteProducts);
}

const modifyFavourite = async (payload, callback) => {
    let updatedMemberInfo;
    const memberInfo = await Member.findById(payload.user_id, 'favouriteProducts');

    if (!memberInfo.favouriteProducts.includes(payload.productId)) {
        //Add a favourite
        updatedMemberInfo = await Member.findByIdAndUpdate({ _id: payload.user_id }, { $push: { favouriteProducts: payload.productId } }, { new: true });
    } else {
        //Remove from favourite
        updatedMemberInfo = await Member.findByIdAndUpdate({ _id: payload.user_id }, { $pull: { favouriteProducts: payload.productId } }, { new: true });
    }
    //Return the updated list of favourites
    return callback(null, updatedMemberInfo.favouriteProducts);
}

const getFavouritesForMember = async (payload, callback) => {
    const favouritesInfo = await Member.findById(payload.user_id, 'photo first_name favouriteProducts').populate('favouriteProducts');
    return callback(null, favouritesInfo);
}