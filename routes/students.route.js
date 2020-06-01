"use strict";

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const StudentsController = require('../controllers/students.controller');

router.get('/classrooms/:id', auth, StudentsController.fetchSubjectsByStudent);
router.get('/class/:id', auth, StudentsController.fecthClasswork);

module.exports = router;