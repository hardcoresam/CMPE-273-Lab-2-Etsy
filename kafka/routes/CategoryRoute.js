const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/CategoryController');
const passport = require('passport');
const checkAuth = passport.authenticate("jwt", { session: false });

router.use(checkAuth);

router.post('/', CategoryController.createCategory);
router.get('/all', CategoryController.getAllCategories);

module.exports = router