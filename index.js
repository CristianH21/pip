"use strict";

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Init middleware
app.use(express.json({ extended: false }));

// Init routes
app.use(
    '/api/auth', 
    cors({ origin: 'http://institutopatriaprimaria.com' }),
    require('./routes/auth.route')
);
app.use(
    '/api/profile', 
    cors({ origin: 'http://institutopatriaprimaria.com' }),
    require('./routes/profile.route')
);
app.use(
    '/api/users', 
    cors({ origin: 'http://institutopatriaprimaria.com' }),
    require('./routes/users.route')
);
app.use(
    '/api/subjects',
    cors({ origin: 'http://institutopatriaprimaria.com' }),
    require('./routes/subjects.route')
);
app.use(
    '/api/groups',
    cors({ origin: 'http://institutopatriaprimaria.com' }),
    require('./routes/groups.route')
);

app.listen(PORT,  () => console.log(`Server running on port 5000`));

