"use strict";

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const ProfileController = require('../controllers/profile.controller');

router.get('/', auth, ProfileController.getProfile);
router.post('/', auth, ProfileController.editProfile);

module.exports = router;