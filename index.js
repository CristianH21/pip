"use strict";

const express = require('express');
const app = express();
const PORT = process.env.PORT || 8081;

// Init middleware
app.use(express.json({ extended: false }));

// CORS
//CORS
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods", 
        "GET, POST, PATCH, PUT, DELETE, OPTIONS"
    );
    next();
});

// Init routes
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/profile', require('./routes/profile.route'));
app.use('/api/users', require('./routes/users.route'));
app.use('/api/subjects', require('./routes/subjects.route'));
app.use('/api/groups', require('./routes/groups.route'));

app.listen(PORT,  () => console.log(`Server running on port 5000`));

