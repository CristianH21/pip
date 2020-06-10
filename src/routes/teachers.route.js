"use strict";

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const TeacherController = require('../controllers/teachers.controller');

router.get('/classrooms/:id', auth, TeacherController.fetchSubjectsByTeacher);
router.get('/class/:id', auth, TeacherController.fecthClasswork);
router.post('/class/:id/period', auth, TeacherController.createPeriod);
router.post('/class/:classId/period/:periodId/assignment', auth, TeacherController.createAssignment);


module.exports = router;