const validate = require("../helpers/validate");

const test = (req, res) => {
        return res.status(200).send({
            message: 'This is a test function from UserController'
        })
}

// Register a new user
const register = (req, res) => {
    const params = req.body;
    // Check that we receive the data
    if (!params.username || !params.email || !params.password) {
        return res.status(400).send({
            status: "Error",
            message: "Missing parameters"
        })
    }
}


module.exports = {
    test,
    register
};