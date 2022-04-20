const JwtStrategy = require("passport-jwt").Strategy;
const Member = require("../models/Member");

require('dotenv').config();

var cookieExtractor = function (req) {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['access-token'];
    }
    return token;
};

module.exports = (passport) => {
    var opts = {
        jwtFromRequest: cookieExtractor,
        secretOrKey: process.env.JWT_SECRET_KEY,
        passReqToCallback: true
    };
    passport.use(
        new JwtStrategy(opts, (req, jwt_payload, callback) => {
            const userId = jwt_payload.user.id;
            Member.findById(userId, (err, results) => {
                if (err) {
                    return callback(err, false);
                }
                if (results) {
                    req.user = jwt_payload.user;
                    callback(null, results);
                }
                else {
                    callback(null, false);
                }
            });
        })
    )
}