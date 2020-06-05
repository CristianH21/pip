"use strict";

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const AssignmentsController = require('../controllers/assignments.controller');

router.get('/assignment/:id', auth, AssignmentsController.fetchAssignmentById);
router.get('/assignment/:assignmentId/student/:studentId', auth, AssignmentsController.fetchAssignmentByStudent);

module.exports = router;

