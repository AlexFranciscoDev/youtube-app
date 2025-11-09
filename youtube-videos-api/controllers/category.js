const Category = require('../models/Category');

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
    // Get Category by id
    Category.findById(id).
        then((category) => {
            return res.status(200).send({
                status: "Success",
                message: "category by id",
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

module.exports = {
    newCategory,
    listCategories,
    getCategoryById
}