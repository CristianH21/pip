"use strict";

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const SubjectsController = require('../controllers/subjects.controller');

router.get('/', auth, SubjectsController.getAllSubjects);
router.post('/subject', auth, SubjectsController.createSubject);

module.exports = router;