const bcrypt = require('bcrypt');
const validate = require("../helpers/validate");
const path = require("path");
const User = require("../models/User");
const Video = require("../models/Video");
const jwt = require('../services/jwt');
const { default: mongoose } = require('mongoose');

const safeUnlink = async (filePath) => {
    try {
        await fs.unlink(filePath)
    } catch (err) {

    }
}


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

const profile = async (req, res) => {
    // If theres no id passed in parameters, use user id
    const userId = req.params.id ? req.params.id : req.user.id;
    try {
        const profile = await User.findOne({ _id: userId });
        if (!profile) {
            return res.status(404).send({
                status: "Error",
                message: "User not found"
            })
        }
        return res.status(200).send({
            status: "Success",
            message: "User found",
            user: profile
        })
    } catch (error) {
        return res.status(404).send({
            status: "Error",
            prueba: 'prueba',
            error: error.message
        })
    }
}

const update = async (req, res) => {
    // Receive user from the url
    const userLogged = req.user;
    // Get image from the request
    const file = req.file;
    // Receive the new parameters (only the name)
    const body = req.body;
    let params = {};
    body.username ? params.username = body.username : '';
    file !== '' ? params.image = file.originalname : '';
    console.log('los parámetros son: ' + file);
    // Check if the username is not already used.
    User.findOne({ username: params.username }).
        exec()
        .then(async userFound => {
            if (userFound) {
                return res.status(409).send({ status: 'Error', message: "Username already used" })
            }
            const updatedUser = await User.findOneAndUpdate({ _id: userLogged.id }, params, {
                new: true
            });
            res.status(200).send({
                status: 'Success',
                message: "User updated correctly",
                user: updatedUser
            })
        })
        .catch(err => {
            return res.status(400).send({ error: err.message, message: "An error ocurred" });
        })

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

const deleteUser = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('user logged: ' + userId);
        // Check that the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({
                status: "Error",
                message: "User not found"
            })
        }

        // Start the transaction
        let session = null;
        try {
            session = await mongoose.startSession();
            session.startTransaction();
            // Get the videos (to delete images)
            const videos = await Video.find({ user: userId })
                .select('_id image')
                .session(session);
            // Delete the videos from the database
            const delVideos = await Video.deleteMany({ user: userId }).session(session);
            // Delete the user from the Database
            await User.deleteOne({ _id: userId }).session(session);
            // Commit the transaction, so the previous lines are triggered
            await session.commitTransaction();
            session.endSession();

            // Delete assets (OUT of the transaction, because fs is not transactional)
            const uploadsDir = path.resolve(process.cwd(), 'uploads', 'videos')
            await Promise.all(
                videos
                    .filter(v => v.image && typeof v.image === "string" && v.image.trim() !== "")
                    .map(v => safeUnlink(path.join(uploadsDir, v.image)))
            );
            return res.status(200).send({
                status: 'Success',
                message: "User deleted correctly",
                deletedVideos: delVideos.deletedCount
            })
        } catch (txErr) {
            // If it doesn't support transactions o something fails, fallback without sesion
            if (session) {
                try { await session.abortTransaction(); } catch (_) { }
                try { session.endSession(); } catch (_) { }
            }
            // Fallback no transaction
            const videos = await Video.find({ user: userId }).select('_id image');
            // Delete videos
            const delVideosRes = await Video.deleteMany({ user: userId });
            // Delete user
            await User.deleteOne({ _id: userId });
            // Delete assets
            const uploadsDir = path.resolve(process.cwd(), 'uploads', 'videos');
            console.log('uploadsDir:' + uploadsDir);
            await Promise.all(
                videos
                    .filter(v => v.image && typeof v.image === "string" && v.image.trim() !== "")
                    .map(v => safeUnlink(path.join(uploadsDir, v.image)))
            );
            return res.status(200).send({
                status: "Success",
                message: "User and videos deleted correctly",
                deletedVideos: delVideosRes.deletedCount,
                note: "Deleted without DB transaction (Mongo may not support transactions).",
            });
        }

    } catch (error) {
        return res.status(500).send({
            status: "Error",
            message: "Error deleting the user",
            message: error.message
        })
    }
}


module.exports = {
    register,
    login,
    profile,
    update,
    updatePassword,
    deleteUser
};
