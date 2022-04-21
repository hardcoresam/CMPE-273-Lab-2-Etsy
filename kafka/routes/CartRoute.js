const express = require('express');
const router = express.Router();
const CartController = require('../controllers/CartController');
const passport = require('passport');
const checkAuth = passport.authenticate("jwt", { session: false });

router.use(checkAuth);

router.post('/add', CartController.addToCart);
router.post('/remove', CartController.removeFromCart);
router.post('/modify', CartController.modifyCart);
router.get('/', CartController.getCartDetails);

module.exports = router