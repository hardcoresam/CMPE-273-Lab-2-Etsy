const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Member = require("../models/Member");
const actions = require('../../util/kafkaActions.json')

exports.handle_request = (payload, callback) => {
    const { action } = payload;
    switch (action) {
        case actions.REGISTER_USER:
            registerUser(payload, callback);
            break;
        case actions.LOGIN:
            login(payload, callback);
            break;
    }
};

const registerUser = async (payload, callback) => {
    const { email, firstName, password } = payload;
    const previousMember = await Member.findOne({ email: email.toLowerCase() });
    if (previousMember !== null) {
        return callback({ errors: { email: { msg: `Email ${email} is already registered. Please login or use a different email` } } }, null);
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newMember = await new Member({
        email: email.toLowerCase(),
        password: hashedPassword,
        first_name: firstName
    }).save();

    const jwtPayload = { user: { id: newMember.id } };
    jwt.sign(jwtPayload, process.env.JWT_SECRET_KEY, (err, token) => {
        if (err) {
            console.error(err);
            return callback({ message: 'Server error' }, null);
        }
        //res.cookie('access-token', token, { maxAge: 900000, httpOnly: false, path: '/' });
        return callback(null, { newMember: newMember, token: token });
    });
}

const login = async (payload, callback) => {
    const { email, password } = payload;
    const member = await Member.findOne({ email: email.toLowerCase() });
    if (member === null) {
        return callback({ errors: { email: { msg: `Email ${email} is not registed with us` } } }, null);
    }
    if (!bcrypt.compareSync(password, member.password)) {
        return callback({ errors: { password: { msg: 'Incorrect password. Please try again!' } } }, null);
    }

    const jwtPayload = { user: { id: member.id } };
    jwt.sign(jwtPayload, process.env.JWT_SECRET_KEY, (err, token) => {
        if (err) {
            console.error(err);
            return callback({ message: 'Server error' }, null);
        }
        //res.cookie('access-token', token, { maxAge: 900000, httpOnly: false });
        return callback(null, { member: member, token: token });
    });
}