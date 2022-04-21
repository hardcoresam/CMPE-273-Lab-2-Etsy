const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const Validation = require('../validations/Validation');

router.post('/login', Validation.loginValidation(), AuthController.login);
router.get('/register', Validation.registrationValidation(), AuthController.registerUser);

module.exports = router