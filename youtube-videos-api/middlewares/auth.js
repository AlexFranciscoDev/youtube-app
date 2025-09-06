const jwt = require("jwt-simple");
const moment = require("moment");
const jwtService = require("../services/jwt");
const secret = jwtService.secret;

const isAuth = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).send({message: "You don't have authorization"})
    }
    const token = req.headers.authorization.replace(/['"]+/g, '');
    let payload = "";
    try {
        payload = jwt.decode(token, secret);
        if (payload.exp <= moment().unix()) {
        return res.status(401).send({message: "Token expired"});
    }
    } catch (error) {
        return res.status(404).send({
            message: "Token not valid",
            error
        })
    }

    req.user = payload;
    next()
}

module.exports = {
    isAuth
}