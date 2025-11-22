const express = require("express");
const router = express.Router();
const VideoController = require("../controllers/video");
const auth = require("../middlewares/auth");
const upload = require('../middlewares/upload');

router.post('/', auth.isAuth, upload.single('image'), VideoController.postVideo);
router.get("/", auth.isAuth, VideoController.listVideos);
router.get('/:id', auth.isAuth, VideoController.getSingleVideo);
router.get('/category/:category', auth.isAuth, VideoController.getVideosByCategory);
router.get('/platform/:platform', auth.isAuth, VideoController.getVideosByPlatform);

module.exports = router;