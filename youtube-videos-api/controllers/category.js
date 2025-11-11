const Category = require('../models/Category');
// Check if a objectId is valid
var ObjectId = require('mongoose').Types.ObjectId;

const newCategory = (req, res) => {
    // Get data from the body
    const body = req.body;
    // Get image from the body
    const file = req.file;
    // Check that we receive all the data needed
    if (!body.name || !body.description || !file) {
        return res.status(400).send({
            status: 'Error',
            message: 'Parameters missing'
        })
    }
    const category = new Category({
        name: body.name,
        description: body.description,
        image: file.originalname
    })

    category.save()
        .then((categorySaved) => {
            return res.status(200).send({
                status: 'Success',
                message: 'New category created',
                category
            })
        })
        .catch((error) => {
            return res.status(400).send({
                status: 'Error',
                message: 'An error ocurred creating the new category',
                error
            })
        })

}

const listCategories = (req, res) => {
    // Get data
    Category.find({})
        .then((categories) => {
            return res.status(200).send({
                status: "Success",
                message: "Categories listed",
                categories
            })
        })
        .catch((error) => {
            return res.status(400).send({
                status: "Error",
                message: "There was an error",
                error
            })
        })
}

const getCategoryById = (req, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        return res.status(400).send({
            status: "Error",
            message: "The id provided is not valid"
        })
    }
    // Get Category by id
    Category.findById(id).
        then((category) => {
            console.log(category);
            if (!category) {
                return res.status(400).send({
                    status: "Error",
                    message: "Category not found"
                })
            }
            return res.status(200).send({
                status: "Success",
                message: "Category found",
                category
            })

        }).
        catch((error) => {
            return res.status(400).send({
                status: "Error",
                error
            })
        })
}

const updateCategory = (req, res) => {
    // Get id of the category
    const id = req.params.id;
    // Get data from the body
    const body = req.body;
    // Get file
    const file = req.file;
    // Find category and update data
    Category.findOneAndUpdate(
        { id: id },
        {
            name: body.name,
            description: body.description,
            image: file.originalname
        },
        { new: true }
    ).then((category) => {
            return res.status(200).send({
                status: "Success",
                message: "Category updated succesfully",
                category
            })
        })
        .catch((error) => {
            return res.status(400).send({
                status: "Error",
                error: error
            })
        })
}

module.exports = {
    newCategory,
    listCategories,
    getCategoryById,
    updateCategory
}