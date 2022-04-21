const Member = require("../models/Member");
const actions = require('../../util/kafkaActions.json')

exports.handle_request = (payload, callback) => {
    const { action } = payload;
    switch (action) {
        case actions.GET_MEMBER:
            getMemberDetails(payload, callback);
            break;
        case actions.UPDATE_MEMBER_CURRENCY:
            updateMemberCurrency(payload, callback);
            break;
        case actions.EDIT_MEMBER_DETAILS:
            editMemberDetails(payload, callback);
            break;
    }
};

const getMemberDetails = async (payload, callback) => {
    const member = await Member.findById(payload.user_id, '-cart -favouriteProducts');
    return callback(null, member);
}

const updateMemberCurrency = async (payload, callback) => {
    await Member.findByIdAndUpdate({ _id: payload.user_id }, { currency: payload.currency });
    return callback(null, { message: 'User currency details updated' });
}

const editMemberDetails = async (payload, callback) => {
    const member = await Member.findById(payload.user_id);
    member.photo = payload.photo;
    member.first_name = payload.firstName;
    member.last_name = payload.lastName;
    member.phone_number = payload.phoneNumber;
    member.gender = payload.gender;
    member.date_of_birth = payload.birthday;
    member.about = payload.about;
    member.address.street_address = payload.streetAddress;
    member.address.apt_no = payload.aptNo;
    member.address.zipcode = payload.zipCode;
    member.address.city = payload.city;
    member.address.state = payload.state;
    member.address.country = payload.country;
    await member.save();
    return callback(null, member);
}