const express = require("express");
const router = express.Router();
const VideoController = require("../controllers/video");
const auth = require("../middlewares/auth");

router.post('/', auth.isAuth, VideoController.postVideo);

module.exports = router;