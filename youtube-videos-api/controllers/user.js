const bcrypt = require('bcrypt');
const validate = require("../helpers/validate");
const User = require("../models/User");
const jwt = require('../services/jwt');


// Register a new user
const register = (req, res) => {
    // Receive the data from the request body
    const params = req.body;
    // Get image from the request
    const file = req.file;

    // Check that we receive all the data needed
    if (!params.username || !params.email || !params.password || !file) {
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
                        password: hash,
                        image: file.originalname
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
    if (!params.email || !params.password) {
        return res.status(400).send({
            status: 'Error',
            message: 'Missing parameters'
        })
    }
    // Search for the user in the database
    User.findOne(
        { email: params.email }
    )
        .then((user) => {
            if (user.length === 0) {
                return res.status(404).send({
                    status: 'Error',
                    message: 'User not found'
                });
            }
            let pwd = bcrypt.compareSync(params.password, user.password);
            if (!pwd) {
                return res.status(400).send({
                    status: 'Error',
                    message: 'User password is not correct'
                })
            }
            const token = jwt.createToken(user);
            return res.status(200).send({
                status: 'Success',
                message: 'User found',
                user: user,
                token
            })
        }).catch((error) => {
            return res.status(404).send({
                status: 'Error',
                message: 'User not found',
                error: error.message
            })
        })
    //https://www.youtube.com/watch?v=TAI68Zlseq8
}

const profile = (req, res) => {
    const userId = req.user;
    // Receive user id
    // Search for the user
    User.findOne({ _id: userId })
        .select({ password: 0, __v: 0, role: 0 })
        .then((user) => {
            return res.status(200).send({
                status: "Success",
                message: "User found",
                user: user
            })
        })
        .catch((error) => {
            return res.status(404).send({
                status: "Error",
                message: "User not found",
                error: error.message
            })
        })

    // REVISAR PORQUE EL DE ARRIBA NO FUNCIONA Y EL DE ABAJO NO
    /* 
        let userId = req.user.id;
    const params = req.params;

    if (params.id) userId = params.id;

    User.findOne({_id: userId})
    .select({password: 0, __v: 0, role: 0})
    .then((user) => {
        return res.status(200).send({
            status: 'Success',
            message: 'Showing profile data',
            user
        })
    })
    .catch((error) => {
        return res.status(400).send({
            status: 'Error',
            message: 'User not found',
            error: error.message
        })
    })
    */

}

const update = async (req, res) => {
    // Receive user from the url
    const userLogged = req.user;
    // Receive the new parameters (only the name)
    const params = req.body;
    if (!params.username) {
        return res.status(400).send({
            status: "Error",
            message: "No username specified"
        })
    } else {
        // Check if the username is not already used.
        User.findOne({ username: params.username }).
            exec()
            .then(async userFound => {
                if (userFound) {
                    return res.status(409).send({ message: "Username already used" })
                }
                const updatedUser = await User.findOneAndUpdate({ _id: userLogged.id }, { username: params.username }, {
                    new: true
                });
                res.status(200).send({
                    message: "User updated correctly",
                    user: updatedUser
                })
            })
            .catch(err => {
                return res.status(400).send({ error: err.message, message: "An error ocurred" });
            })
    }
}

const updatePassword = async (req, res) => {
    const user = req.user;
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.password;

    if (!currentPassword || !newPassword)
        return res.status(400).send({ status: "Error", message: "Parameters missing" });

    const loggedUser = await User.findOne({ _id: user.id });

    const match = await bcrypt.compare(currentPassword, loggedUser.password);

    if (!match)
        return res.status(401).send({ status: 'Error', message: 'Incorrect current password' });

    try {
        const hash = await bcrypt.hash(newPassword, 10);
        const updatedUser = await User.findOneAndUpdate(
            { _id: user.id },
            { password: hash },
            { new: true }
        );

        return res.status(200).send({
            message: "User updated correctly",
            user: updatedUser
        });
    } catch (error) {
        return res.status(500).send({
            status: 'Error',
            message: 'Error encrypting or updating the password'
        });
    }
}

const deleteUser = (req, res) => {
    // Get user logged
    // Check that the user exists in the database
    /*
        HACER ESTO MAS ADELANTE
        Consideraciones que dejarías para cuando tengas modelos de vídeos/categorías:
        Borrado en cascada o reasignación de vídeos, comentarios y metadatos.
        Eliminación de archivos (avatares, videos) en almacenamiento externo.
        Revocar tokens/sesiones y limpiar refresh tokens.
        Operaciones en transacción para mantener consistencia.
        Auditoría/logging y posible ventana de gracia para recuperación.
    */
    return res.status(200).send({
        status: 200,
        message: "DELETING USER"
    })
}


module.exports = {
    register,
    login,
    profile,
    update,
    updatePassword,
    deleteUser
};