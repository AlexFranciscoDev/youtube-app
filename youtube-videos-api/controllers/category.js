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
        user: req.user.id,
        name: body.name,
        description: body.description,
        image: file.path
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
            // Duplicate key error: this user already has a category with that name
            if (error.code === 11000) {
                return res.status(400).send({
                    status: 'Error',
                    message: 'You already have a category with that name'
                })
            }
            return res.status(400).send({
                status: 'Error',
                message: 'An error ocurred creating the new category',
                error
            })
        })

}

const listCategories = (req, res) => {
    // Get only the categories that belong to the logged in user
    Category.find({ user: req.user.id })
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
            // Categories are private, only the owner can see them
            if (category.user != req.user.id) {
                return res.status(403).send({
                    status: "Error",
                    message: "You are not allowed to see this category"
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

const updateCategory = async (req, res) => {
    // Get id of the category
    const id = req.params.id;
    // Get data from the body
    const body = req.body;
    // Get file
    const file = req.file;
    // Construsct object with the updated fields
    const updatedFields = {};
    if (body.name) updatedFields.name = body.name;
    if (body.description) updatedFields.description = body.description;
    if (file) updatedFields.image = file.path;

    try {
        // Check that the category exists and belongs to the logged in user
        const categoryToUpdate = await Category.findById(id);
        if (!categoryToUpdate) {
            return res.status(404).send({
                status: "Error",
                message: "Category not found"
            })
        }
        if (categoryToUpdate.user != req.user.id) {
            return res.status(403).send({
                status: "Error",
                message: "You are not allowed to edit this category"
            })
        }

        // Find category and update data
        const category = await Category.findOneAndUpdate(
            { _id: id },
            updatedFields,
            { new: true }
        );
        return res.status(200).send({
            status: "Success",
            message: "Category updated succesfully",
            category
        })
    } catch (error) {
        // Duplicate key error: this user already has a category with that name
        if (error.code === 11000) {
            return res.status(400).send({
                status: "Error",
                message: "You already have a category with that name"
            })
        }
        return res.status(400).send({
            status: "Error",
            error: error
        })
    }
}

const deleteCategory = async (req, res) => {
    // Get category id
    const id = req.params.id;

    try {
        // Check that the category exists and belongs to the logged in user
        const category = await Category.findById(id);
        if (!category) {
            return res.status(400).send({
                status: 'Error',
                message: 'Category not found'
            })
        }
        if (category.user != req.user.id) {
            return res.status(403).send({
                status: 'Error',
                message: 'You are not allowed to delete this category'
            })
        }

        // Delete category by id
        const categoryDeleted = await Category.findOneAndDelete({ _id: id });
        return res.status(200).send({
            status: 'Success',
            message: 'Deleting category',
            categoryDeleted
        })
    } catch (error) {
        return res.status(400).send({
            status: 'Error',
            error: error.message
        })
    }
}

module.exports = {
    newCategory,
    listCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
}