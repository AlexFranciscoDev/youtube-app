const bcrypt = require('bcrypt');
const validate = require("../helpers/validate");
const User = require("../models/User");
const jwt = require('jwt');

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

const login = async (req, res) => {
    // Receive data from the body of the peticion
    const params = req.body;
    // Verify that the data has been received
    if (!params.username || !params.password) {
        return res.status(400).send({
            status: 'Error',
            message: 'Missing parameters'
        })
    }
    // Search for the user in the database
    const user = await User.find({ username: params.username }).exec();
    // Check if the user exists
    if (user.length <= 0) return res.status(400).send({ status: 'Error', message: 'User or password not correct' })
    // Compare passwords
    let pwd = bcrypt.compareSync(params.password, user[0].password);
    // Check if its correct
    if (!pwd) {
        return res.status(400).send({ status: 'Error', message: 'User or password not correct' })
    } else {
        const token = jwt.createToken(user);
        return res.status(200).send({
            status: 'Success',
            message: 'User found',
            user: user,
            token
        })
    }
    // Generate token
    // Send response
    return {}
}


module.exports = {
    test,
    register,
    login
};