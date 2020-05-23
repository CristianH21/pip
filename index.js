"use strict";

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Init middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Init routes
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/profile', require('./routes/profile.route'));
app.use('/api/users', require('./routes/users.route'));
app.use('/api/subjects', require('./routes/subjects.route'));
app.use('/api/groups', require('./routes/groups.route'));

app.listen(PORT,  () => console.log(`Server running on port 5000`));

