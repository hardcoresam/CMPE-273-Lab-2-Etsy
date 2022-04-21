const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const passport = require('passport');
const checkAuth = passport.authenticate("jwt", { session: false });

router.use(checkAuth);

router.post('/', OrderController.placeOrder);
router.get('/all', OrderController.getAllOrders);

module.exports = router