const validate = require("../helpers/validate");
const User = require("../models/User");

const test = (req, res) => {
        return res.status(200).send({
            message: 'This is a test function from UserController'
        })
}

// Register a new user
const register = (req, res) => {
    // Receive the data from the request body
    const params = req.body;

    // Check that we receive all the data needed
    if (!params.username || !params.email || !params.password) {
        return res.status(400).send({
            status: "Error",
            message: "Missing parameters"
        })
    }
    // Validate the data. If its not valid, return an error
    try {
        validate(params);
    } catch (error) {
        return res.status(400).send({
            status: 'Error',
            message: error.message
        })
    }
    // Check if the user already exists
    User.find({
        $or: [
            {username: params.username},
            {email: params.email}
        ]
    }).then((users) => {
        if (users.length > 0) {
            return res.status(400).send({
                status: 'Error',
                message: 'User already exists with that username or email'
            })
        } else {
            // If everything is ok, create a new user.
            // Before saving, we should hash or encrypt the password
            return res.status(200).send({
            status: 'Success',
            message: 'User registered successfully'
        });
        }
    })

}


module.exports = {
    test,
    register
};