const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');
const auth = require("../middlewares/auth");
const upload = require('../middlewares/upload');

router.post("/register", upload.single('image'), UserController.register);
router.post('/login', UserController.login);
router.get('/profile', auth.isAuth, UserController.profile);
router.put("/profile", auth.isAuth, UserController.update);
router.put("/profile/password", auth.isAuth, UserController.updatePassword);
router.delete("/delete", auth.isAuth, UserController.deleteUser);

module.exports = router;
