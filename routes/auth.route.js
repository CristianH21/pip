"use strict";

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const LoginController = require('../controllers/auth.controller');

router.get('/', auth, LoginController.authUser);
router.post('/login', LoginController.login);
router.post('/password', auth, LoginController.changePassword);

module.exports = router;