const express = require("express");
const router = express.Router();
const VideoController = require("../controllers/video");
const auth = require("../middlewares/auth");
const upload = require('../middlewares/upload');

router.post('/', auth.isAuth, upload.single('image'), VideoController.postVideo);

module.exports = router;