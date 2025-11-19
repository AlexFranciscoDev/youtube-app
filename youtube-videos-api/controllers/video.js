const mongoose = require("mongoose");
const Video = require("../models/Video");
const Category = require("../models/Category");

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

module.exports = {
    postVideo
}