const mongoose = require("mongoose");
const Video = require("../models/Video");
const Category = require("../models/Category");
const User = require("../models/User");

var ObjectId = require('mongoose').Types.ObjectId;

const postVideo = async (req, res) => {
    // Get user id
    const userId = req.user.id;
    // Get data from the body
    const body = req.body;
    // Get image video
    const file = req.file;
    // Check if you receive the data
    if (!body.title || !body.description || !body.url || !body.category || !body.platform || !file) {
        return res.status(400).send({
            status: "Error",
            message: "Parameters missing",
        })
    }
    // Check if the category introduced exists
    if (!mongoose.Types.ObjectId.isValid(body.category)) {
        return res.status(400).send({
            status: "Error",
            message: "Category not found"
        })
    }

    // Create object with all the data
    const video = new Video({
        user: userId,
        title: body.title,
        description: body.title,
        url: body.url,
        category: body.category,
        platform: body.platform,
        image: file.originalname
    })

    video.save()
        .then((videoSaved) => {
            return res.status(200).send({
                status: 'Success',
                message: 'New video created',
                videoSaved
            })
        })
        .catch((error) => {
            return res.status(400).send({
                status: 'Error',
                error
            })
        })

}

const listVideos = async (req, res) => {
    try {
        const videos = await Video.find({});
        if (!videos || videos.length === 0) {
            return res.status(404).send({
                status: 'Error',
                message: 'Videos not found'
            })
        }
        return res.status(200).send({
            status: "Success",
            message: "Listing all the videos",
            videos
        })
    } catch (error) {
        return res.status(400).send({
            status: "Error",
            message: "An error occured trying to get the videos",
            error
        })
    }
}

const getSingleVideo = async (req, res) => {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
        return res.status(400).send({
            status: "Error",
            message: "The id provided is not valid"
        })
    }

    try {
        const video = await Video.findById({ _id: id });
        if (!video || video.length === 0) {
            return res.status(404).send({
                status: "Error",
                message: "Video not found"
            })
        }
        return res.status(200).send({
            status: 'Success',
            message: 'Video found',
            video
        })
    } catch (error) {
        return res.status(400).send({
            status: "Error",
            message: "An error occured trying to get the video",
            error
        })
    }


}

const getVideosByCategory = async (req, res) => {
    const category = req.params.category;

    if (!ObjectId.isValid(category)) {
        return res.status(400).send({
            status: "Error",
            message: "The category id provided is not valid"
        })
    }

    await Video.find({ category: category })
        .then(videosFound => {

            if (videosFound.length === 0) {
                return res.status(400).send({
                    status: 'Error',
                    message: 'Videos from this category not found'
                })
            }

            return res.status(200).send({
                status: 'Success',
                message: 'Getting videos by category',
                videosFound
            })
        })
        .catch(error => {
            return res.status(400).send({
                status: 'Error',
                error
            })
        })
}

const getVideosByPlatform = async (req, res) => {
    const platform = req.params.platform;
    try {
        const videos = await Video.find({ 'platform': platform })

        if (!videos || videos.length === 0) {
            return res.status(404).send({
                status: 'Error',
                message: `No videos from platform ${platform}`
            })
        }

        return res.status(200).send({
            status: 'Success',
            message: 'Getting videos by platform',
            videos
        })
    } catch (error) {
        return res.status(400).send({
            status: 'Error',
            error
        })
    }
}

const getVideosByUser = async (req, res) => {
    let userId = req.params.id;
    const loggedUserId = req.user.id;
    // If the user is not passed as a parameter, use the user id from the logged in user
    if (userId === "" || userId === undefined) {
        userId = loggedUserId;
    }

    // Validate that the id is a valid ObjectId
    if (!ObjectId.isValid(userId)) {
        return res.status(400).send({
            status: "Error",
            message: "The user id provided is not valid"
        })
    }

    try {
        // Check if the user exists in the database
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).send({
                status: 'Error',
                message: 'User not found'
            })
        }

        // Find videos by user id
        const videos = await Video.find({ user: userId })
            .populate('user', 'username email')
            .populate('category', 'name description');

        if (!videos || videos.length === 0) {
            // Check if user is viewing their own videos or another user's videos
            return res.status(404).send({
                status: 'Error',
                message: 'This user has no videos'
            })
        }

        return res.status(200).send({
            status: 'Success',
            message: 'Getting videos by user',
            videos
        })
    } catch (error) {
        return res.status(400).send({
            status: "Error",
            message: "An error occured trying to get the videos",
            error: error.message
        })
    }
}

/**
 * Filter videos by platform and category
 */
const getVideosByPlatformAndCategory = async (req, res) => {
    // Check if we receive both platform and category
    const { platform, category } = req.query;

    if (!platform || !category) {
        return res.status(400).send({
            status: 'Error',
            message: 'Missing paremeters'
        })
    }

    // Check if categorie is valid id
    if (!ObjectId.isValid(category)) {
        return res.status(400).send({
            status: "Error",
            message: "The category id provided is not valid"
        })
    }

    try {
        const videos = await Video.find({
            platform: platform,
            category: category
        })

        if (!videos || videos.length === 0) {
            return res.status(404).send({
                status: 'Error',
                message: 'No videos found'
            })
        }
        return res.status(200).send({
            status: 'Success',
            message: 'Returning videos by platform and category',
            videos
        })
    } catch (error) {
        return res.status(400).send({
            status: 'Error',
            error
        })
    }
}

/**
 * editVideo
 */
const editVideo = async (req, res) => {
    // Get id of the video
    const id = req.params.id;
    // Get user id from authenticated user
    const userId = req.user.id;
    // Construct objects with the parameters from the body
    //const body = {}
    // Check if the id is valid
    if (!ObjectId.isValid(id)) {
        return res.status(400).send({
            status: 'Error',
            message: 'The id provided is not valid',
        })
    }
    // REVIEW!!!!!! Check that the video is from the user logged
    // Check if the video exists
    const videoToUpdate = await Video.findById(id);
    
    try {
        if (!videoToUpdate || videoToUpdate.length === 0) {
            return res.status(404).send({
                status: 'Error',
                message: 'No video found'
            })
        }

        return res.status(200).send({
            status: 'Success',
            message: 'Video found'
        })
    }  catch (error) {
        return res.status(400).send({
            status: 'Error',
            error
        })
    }
}

module.exports = {
    postVideo,
    listVideos,
    getSingleVideo,
    getVideosByCategory,
    getVideosByPlatform,
    getVideosByUser,
    getVideosByPlatformAndCategory,
    editVideo
}