"use strict";

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const GroupsController = require('../controllers/groups.controller');

router.get('/', auth, GroupsController.getAllGroups);
router.post('/group', auth, GroupsController.createGroup);

module.exports = router;