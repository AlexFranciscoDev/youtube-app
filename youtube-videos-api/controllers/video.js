const testVideo = (req, res) => {
    return res.status(200).send({
        message: 'This is a test function from VideoController'
    });
}

module.exports = {
    testVideo
}