const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const Validation = require('../validations/Validation');

router.post('/login', Validation.loginValidation(), AuthController.login);
router.post('/register', Validation.registrationValidation(), AuthController.registerUser);

module.exports = router