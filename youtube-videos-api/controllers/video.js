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
    const idsBody = req.body.ids;
    console.log(idsBody);
    // Check if it's single DELETE or multiple DELETE
    // 1.2. Detectar si es borrado múltiple:
    // Si no → borrado único
    if (idsBody && Array.isArray(idsBody) && idsBody.length > 0) {
        // Validar que todos los IDs sean ObjectIds válidos
        idsBody.forEach((id) => {
            if (!Object.isValid(id)) {
                return res.status(400).send({
                    status: 'Error',
                    message: `The id ${id} is not a valid ObjectId`
                })
            }
        })
        // Buscar los videos con Video.find({ _id: { $in: ids } })
        // Verificar que existan
        // Verificar que todos pertenezcan al usuario logueado
        // Borrar con Video.deleteMany({ _id: { $in: ids }, user: userId })
        // Responder con el número de videos borrados
    } else {
        // If not, SINGLE DELETE
    }
    return res.status(200).send({
        status: 'Success',
        message: 'Deleting video'
    })
    /**
     * 1. Crear el método en el controlador (controllers/video.js)
1.3. Para borrado múltiple:
1.4. Para borrado único:
Validar que el ID sea válido
Buscar el video con Video.findById(id)
Verificar que exista
Verificar que pertenezca al usuario logueado
Borrar con Video.findByIdAndDelete(id)
Responder con el video borrado
1.5. Manejo de errores:
Usar try/catch
Respuestas apropiadas según el caso (400, 404, 200)
1.6. Exportar el método:
Agregar deleteVideo al module.exports
     */
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