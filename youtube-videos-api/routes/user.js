const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');
const auth = require("../middlewares/auth");

router.post("/register", UserController.register);
router.post('/login', UserController.login);
router.get('/profile/:id', auth.isAuth, UserController.profile);
router.put("/profile/:id", UserController.update)

module.exports = router;