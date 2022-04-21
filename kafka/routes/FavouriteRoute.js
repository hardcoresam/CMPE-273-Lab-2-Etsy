const express = require('express');
const router = express.Router();
const FavouriteController = require('../controllers/FavouriteController');
const passport = require('passport');
const checkAuth = passport.authenticate("jwt", { session: false });

router.use(checkAuth);

router.get('/all', FavouriteController.getAllFavourites);
router.post('/', FavouriteController.modifyFavourite);
router.get('/for-member', FavouriteController.getFavouritesForMember);

module.exports = router