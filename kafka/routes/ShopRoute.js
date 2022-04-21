const express = require('express');
const router = express.Router();
const ShopController = require('../controllers/ShopController');
const Validation = require('../validations/Validation');
const passport = require('passport');
const checkAuth = passport.authenticate("jwt", { session: false });

router.use(checkAuth);

router.get('/', ShopController.getShop);
router.get('/:shopId', ShopController.getShopById);
router.post('/available', Validation.checkShopNameValidation(), ShopController.checkShopNameAvailability);
router.post('/', ShopController.createShop);
router.post('/image', ShopController.changeShopImage);

module.exports = router