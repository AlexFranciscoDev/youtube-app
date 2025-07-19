const testCategory = (req, res) => {
    res.status(200).send({
        message: "This is a test for the category controller"
    })
}

module.exports = {
    testCategory
}