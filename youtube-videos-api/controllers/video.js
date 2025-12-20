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
    // Image file
    const file = req.file;
    // Construct object with only the parameters that are provided in the body
    const body = {};
    
    if (req.body.title !== undefined) body.title = req.body.title;
    if (req.body.description !== undefined) body.description = req.body.description;
    if (req.body.url !== undefined) body.url = req.body.url;
    if (req.body.category !== undefined) body.category = req.body.category;
    if (req.body.platform !== undefined) body.platform = req.body.platform;
    if (file !== undefined && file !== null) body.image = file.originalname;
    // Check if at least one field is provided to update
    if (Object.keys(body).length === 0) {
        return res.status(400).send({
            status: 'Error',
            message: 'No fields to update provided'
        })
    }
    
    // Check if the id is valid
    if (!ObjectId.isValid(id)) {
        return res.status(400).send({
            status: 'Error',
            message: 'The id provided is not valid',
        })
    }
    // Check if the video exists
    const videoToUpdate = await Video.findById(id);
    
    try {
        if (!videoToUpdate || videoToUpdate.length === 0) {
            return res.status(404).send({
                status: 'Error',
                message: 'No video found'
            })
        }
        // Check that the video is from the user logged
        if (videoToUpdate.user != userId) {
            return res.status(400).send({
                status: 'Error',
                message: 'You are not allowed to edit this post'
            })
        }
        
        // Update the updatedAt field
        body.updatedAt = new Date();
        
        // Edit video and get the updated version
        const updatedVideo = await Video.findOneAndUpdate(
            {_id: id}, 
            { $set: body }, 
            {
                new: true,
                runValidators: true
            }
        );
        
        return res.status(200).send({
            status: 'Success',
            message: 'Video edited successfully',
            video: updatedVideo
        })
    }  catch (error) {
        return res.status(400).send({
            status: 'Error',
            error
        })
    }
}

const deleteVideo = async (req, res) => {
    const userId = req.user.id;
    const videoId = req.params.id;
    const idsBody = req.body && req.body.ids;
    // Check if it's single DELETE or multiple DELETE
    if (idsBody && Array.isArray(idsBody) && idsBody.length > 0) {
        // Validate that all IDs are valid ObjectIds
        idsBody.forEach((id) => {
            if (!ObjectId.isValid(id)) {
                return res.status(400).send({
                    status: 'Error',
                    message: `The id ${id} is not a valid ObjectId`
                })
            }
        })
        // Search the videos
        const videos = await Video.find({_id: {$in: idsBody}})
        try {
            // Verify that the videos exists
            if (!videos || videos.length === 0) {
                return res.status(400).send({
                    status: 'Error',
                    message: 'No videos found'
                })
            }
            // Verify that the videos belong to the user logged
            videos.forEach((video) => {
                if (video.user != userId) {
                    return res.status(403).send({
                        status: 'Error',
                        message: 'You are not allowed to delete this video'
                    })
                }
            })
            // Delete many videos
            const deletedVideos = await Video.deleteMany({_id: {$in: idsBody}, user: userId});
            return res.status(200).send({
                status: 'Success',
                message: 'Deleting multiple videos',
                deletedVideos
            })
        } catch (error) {
            return res.status(400).send({
                status: 'Error',
                error
            })
        }
    } else {
        // If not, SINGLE DELETE using the id from URL params
        // Check if videoId exists (it won't exist in /bulk route)
        if (!videoId) {
            return res.status(400).send({
                status: 'Error',
                message: 'Video ID is required'
            })
        }
        // Validate that the video ID in the URL param is a valid ObjectId
        if (!ObjectId.isValid(videoId)) {
            return res.status(400).send({
                status: 'Error',
                message: `The id ${videoId} is not a valid ObjectId`
            })
        }
        // Search the video with Video.findById(videoId)
        const video = await Video.findById(videoId);
        console.log(`video not found: ${video}`);
        // Verify that the video exists
        try {
            if (!video || video.length === 0) {
                return res.status(400).send({
                    status: "Error",
                    message: "Video not found" 
                })
            }
        } catch (error) {
            return res.status(400).send({
                status: "Error",
                error
            })
        }
        // Check the video belongs to the logged user
        if (video.user != userId) {
            return res.status(403).send({
                status: 'Error',
                message: 'You are not allowed to delete this video'
            })
        }
        // Delete using Video.findByIdAndDelete(videoId)
        try {
            const deletedVideo = await Video.findByIdAndDelete(videoId);
            return res.status(200).send({
                status: 'Success',
                message: 'Deleting single video',
                deletedVideo
            })
            // Respond with deleted video info (or appropriate error)
        } catch (error) {
            return res.status(400).send({
                status: 'Error',
                error
            })
        }
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
    editVideo,
    deleteVideo
}