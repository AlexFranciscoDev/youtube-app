const mongoose = require("mongoose");
const {Schema, model} = require("mongoose");

const VideoSchema = new mongoose.Schema({
    user: {
        type: Schema.ObjectId,
        ref: "User"
    },
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    category: {
        type: Schema.ObjectId,
        ref: "Category"
    },
    platform: {
        type: String,
        enum: ["Youtube", "TikTok", "Instagram"],
        required: true
    },
    image: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model("Video", VideoSchema);