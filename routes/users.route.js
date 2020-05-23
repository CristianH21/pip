"use strict";

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const UsersController = require('../controllers/users.controller');

router.get('/students', auth, UsersController.getAllStudents);
router.post('/student', auth, UsersController.createStudent);
router.get('/teachers', auth, UsersController.getAllTeachers);
router.post('/teacher', auth, UsersController.createTeacher);
router.get('/staff', auth, UsersController.getAllStaff);
//router.post('/staff', auth);

module.exports = router;