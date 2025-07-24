const bcrypt = require('bcrypt');
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
    User.exists({
        $or: [
            { username: params.username },
            { email: params.email }
        ]
    }).then((exists) => {
        if (exists) {
            return res.status(400).send({
                status: 'Error',
                message: 'User already exists with that username or email'
            })
        } else {
            // If everything is ok, create a new user.
            // Before saving, we should hash or encrypt the password
            bcrypt.hash(params.password, 10, (error, hash) => {
                if (error) {
                    return res.status(500).send({
                        status: 'Error',
                        message: 'Error encrypting the password'
                    })
                } else {
                    const user = new User({
                        username: params.username,
                        email: params.email,
                        password: hash
                    })
                    user.save()
                        .then((savedUser) => {
                            return res.status(200).send({
                                status: 'Success',
                                message: 'User registered successfully',
                                user: savedUser
                            });
                        })
                        .catch((error) => {
                            console.error("Error creating user:", error);
                            return res.status(500).send({
                                status: 'Error',
                                message: "User can't be created due to an internal error."
                            });
                        });
                }
            })
            
        }
    })

}


module.exports = {
    test,
    register
};