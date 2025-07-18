const test = (req, res) => {
        return res.status(200).send({
            message: 'This is a test function from UserController'
        })
}


module.exports = {
    test
};