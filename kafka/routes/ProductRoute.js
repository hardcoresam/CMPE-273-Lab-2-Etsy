const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const Validation = require('../validations/Validation');
const passport = require('passport');
const checkAuth = passport.authenticate("jwt", { session: false });

router.use(checkAuth);

router.post('/', Validation.addProductValidation(), ProductController.createProduct);
router.post('/filtered', ProductController.filterProducts);
router.post('/:productId', Validation.addProductValidation(), ProductController.editProduct);
router.get('/all', ProductController.getAllProducts);
router.get('/:productId', ProductController.getProductById);

module.exports = router