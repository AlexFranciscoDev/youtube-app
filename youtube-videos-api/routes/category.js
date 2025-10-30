const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/category");

router.get("/test", CategoryController.testCategory);
router.post('/new', CategoryController.newCategory);

module.exports = router;