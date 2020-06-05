"use strict";

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const SubjectsController = require('../controllers/subjects.controller');

router.get('/', auth, SubjectsController.getAllSubjects);
router.get('/subject/:subjectId', auth, SubjectsController.fetchSubjectById)
router.post('/subject', auth, SubjectsController.createSubject);
router.put('/subject/:subjectId', auth, SubjectsController.putSubject);
router.delete('/subject/:subjectId', auth, SubjectsController.deleteSubject);

module.exports = router;