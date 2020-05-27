"use strict";

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const ClassroomsController = require('../controllers/classrooms.controller');

router.get('/', auth, ClassroomsController.getAllClassrooms);
router.get('/classroom');

module.exports = router;