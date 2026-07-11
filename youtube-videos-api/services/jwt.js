const jwt = require('jwt-simple');
const moment = require('moment');

const secret = process.env.JWT_SECRET;

if (!secret && process.env.NODE_ENV !== 'test') {
    throw new Error('JWT_SECRET environment variable is not set');
}

const createToken = (user) => {
    const payload = {
        id: user._id,
        username: user.username,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()
    }
    return jwt.encode(payload, secret)
}

module.exports = { createToken, secret };