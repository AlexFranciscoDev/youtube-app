const jwt = require('jwt-simple');
const moment = require('moment');

const secret = 'SECRET_KEY_YOUTUBE_KEY_124221';

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