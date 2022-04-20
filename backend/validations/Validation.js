const { body } = require('express-validator');

exports.registrationValidation = () => {
    return [
        body('email', 'Please enter a valid email').isEmail(),
        body('firstName', 'Please enter a valid first name').matches(/^[A-Za-z\s]+$/).trim(),
        body('password', 'Please enter a valid password of minimum 5 characters').isLength({ min: 5 })
    ];
}

exports.loginValidation = () => {
    return [
        body('email', 'Please enter a valid email').isEmail(),
        body('password', 'Please enter a valid password of minimum 5 characters').isLength({ min: 5 })
    ];
}

exports.checkShopNameValidation = () => {
    return [
        body('shopName', 'Shop name should have atleast 4 characters').isLength({ min: 4 })
    ];
}

exports.addProductValidation = () => {
    return [
        body('name', 'Product name should have atleast 4 characters').isLength({ min: 4 }),
        body('price', 'Please enter a valid product price').isFloat({ min: 0, max: 1000 }),
        body('quantityAvailable', 'Please enter a valid quantity').isFloat({ min: 0, max: 1000 })
    ];
}

exports.updateMemberValidation = () => {
    return [
        body('firstName', 'Please enter a valid first name').matches(/^[A-Za-z\s]+$/).trim(),
        body('lastName', 'Please enter a valid last name').matches(/^[A-Za-z\s]+$/).optional({ nullable: true, checkFalsy: true }).trim(),
        body('phoneNumber', 'Please enter a valid phone number of 10 digits').isMobilePhone().optional({ nullable: true, checkFalsy: true }),
        body('gender', 'Please select a valid option for gender').isIn(['MALE', 'FEMALE', 'RATHER_NOT_SAY']).optional({ nullable: true, checkFalsy: true }),
        body('birthday', 'Please select a valid birthday').isDate().optional({ nullable: true, checkFalsy: true }),
        body('zipCode', 'Please enter a valid zipcode').matches(/(^\d{5}$)/).optional({ nullable: true, checkFalsy: true }),
        body('city', 'Please enter a valid city').matches(/^[A-Za-z\s]+$/).optional({ nullable: true, checkFalsy: true }),
        body('state', 'Please enter a valid state').matches(/^[A-Za-z\s]+$/).optional({ nullable: true, checkFalsy: true })
    ];
}