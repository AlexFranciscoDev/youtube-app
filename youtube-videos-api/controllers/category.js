const testCategory = (req, res) => {
    res.status(200).send({
        message: "This is a test for the category controller"
    })
}

const newCategory = (req, res) => {
    // Get data from the body
    const params = req.body;
    console.log(params);
    return res.status(200).send({
        status: 'Success',
        message: 'New category'
    })
}

module.exports = {
    testCategory,
    newCategory
}