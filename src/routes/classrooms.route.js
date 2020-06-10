"use strict";

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const ClassroomsController = require('../controllers/classrooms.controller');

router.get('/', auth, ClassroomsController.getAllClassrooms);
router.get('/:id', auth, ClassroomsController.oneClassroomById);
router.post('/classroom', auth, ClassroomsController.createClassroom);
router.put('/classroom', auth, ClassroomsController.updateClassroomById);
router.put('/classroom/students', auth, ClassroomsController.updateClassroomByStudents);
router.put('/classroom/subjects', auth, ClassroomsController.updateClassroomBySubjects);

module.exports = router;