const testCategory = (req, res) => {
    res.status(200).send({
        message: "This is a test for the category controller"
    })
}

const newCategory = (req, res) => {
    // Get data from the body
    const body = req.body;
    // Get image from the body
    const file = req.file;
    // Check that we receive all the data needed
    if (!body.name || !body.description || !req.file) {
        return res.status(400).send({
            status: 'Error',
            message: 'Parameters missing'
        })
    }
    return res.status(200).send({
        status: 'Success',
        message: 'New category'
    })
}

module.exports = {
    testCategory,
    newCategory
}