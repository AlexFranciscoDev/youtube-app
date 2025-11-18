const mongoose = require("mongoose");
const Video = require("../models/Video");
const Category = require("../models/Category");

const postVideo = async (req, res) => {
    // Get user id
    const userId = req.user.id;
    // Get data from the body
    const body = req.body;
    // Check if you receive the data
    if (!body.title || !body.description || !body.url || !body.category || !body.platform) {
        return res.status(400).send({
            status: "Error",
            message: "Parameters missing"
        })
    }
    // Check if the category introduced exists
    if (!mongoose.Types.ObjectId.isValid(body.category)) {
         return res.status(400).send({
            status: "Error",
            message: "Category not found"
        })
    }

    await Category.findById(body.category)
    .then((categoryFound) => {
        if (!categoryFound) {
        }
    })
    // Create object with all the data
    const Video = {
        user: userId,
        title: body.title,
        description: body.title,
        url: body.url
    }
    
    return res.status(200).send({
        status: 'Success',
        message: 'Posting a new video'
    })
}

module.exports = {
    postVideo
}