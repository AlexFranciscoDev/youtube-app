const mongoose = require("mongoose");
const Video = require("../models/Video");
const Category = require("../models/Category");

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
    const video = new Video ({
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
        const video = await Video.findById({_id: id});
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

    // Video.findById({_id: id})
    // .then(videoFound => {
    //     if (!videoFound) {
    //         return res.status(404).send({
    //         status: 'Error',
    //         message: 'Video not found'
    //     })
    //     }
    //     return res.status(200).send({
    //         status: 'Success',
    //         message: 'Video found',
    //         videoFound
    //     })
    // })
    // .catch(err => {
    //     return res.status(400).send({
    //         status: 'Error',
    //         message: 'Error trying to get the video',
    //         err
    //     })
    // })
}

const getVideosByCategory = async (req, res) => {
    const category = req.params.category;

    if (!ObjectId.isValid(category)) {
        return res.status(400).send({
            status: "Error",
            message: "The category id provided is not valid"
        })
    }
    
    await Video.find({category: category})
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
        const videos = await Video.find({'platform': platform})

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

module.exports = {
    postVideo,
    listVideos,
    getSingleVideo,
    getVideosByCategory,
    getVideosByPlatform
}