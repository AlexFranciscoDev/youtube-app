const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/category");
const upload = require('../middlewares/upload');
const auth = require("../middlewares/auth");

router.post('/new', auth.isAuth, upload.single('image'), CategoryController.newCategory);
router.get("/", auth.isAuth, CategoryController.listCategories);
router.get("/:id", auth.isAuth, CategoryController.getCategoryById);
router.put("/:id", auth.isAuth, upload.single("image"), CategoryController.updateCategory);


module.exports = router;