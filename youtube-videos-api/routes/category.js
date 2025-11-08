const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/category");
const upload = require('../middlewares/upload');

router.get("/test", CategoryController.testCategory);
//router.post('/new', upload.single('image'), CategoryController.newCategory);
router.post('/new', CategoryController.newCategory);


module.exports = router;