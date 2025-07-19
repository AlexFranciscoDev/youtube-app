const express = require("express");
const router = express.Router();
const VideoController = require("../controllers/video");

router.get("/testVideo", VideoController.testVideo);

module.exports = router;