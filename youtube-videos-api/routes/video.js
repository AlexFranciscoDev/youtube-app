const express = require("express");
const router = express.Router();
const VideoController = require("../controllers/video");
const auth = require("../middlewares/auth");
const upload = require('../middlewares/upload');

router.post('/', auth.isAuth, upload.single('image'), VideoController.postVideo);
router.get("/", auth.isAuth, VideoController.listVideos);
router.get('/filter', auth.isAuth, VideoController.getVideosByPlatformAndCategory);
router.get('/category/:category', auth.isAuth, VideoController.getVideosByCategory);
router.get('/platform/:platform', auth.isAuth, VideoController.getVideosByPlatform);
router.get('/user/:id', auth.isAuth, VideoController.getVideosByUser);
router.get('/user', auth.isAuth, VideoController.getVideosByUser);
router.get('/:id', auth.isAuth, VideoController.getSingleVideo);

module.exports = router;