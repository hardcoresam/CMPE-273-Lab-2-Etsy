const express = require('express');
const router = express.Router();
const MemberController = require('../controllers/MemberController');
const Validation = require('../validations/Validation');
const passport = require('passport');
const checkAuth = passport.authenticate("jwt", { session: false });

router.use(checkAuth);

router.get('/', MemberController.getMemberDetails);
router.post('/currency', MemberController.updateMemberCurrency);
router.post('/', Validation.updateMemberValidation(), MemberController.editMemberDetails);

module.exports = router