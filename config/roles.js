module.exports = {
    superadmin: [
        '/api/auth', 
        '/api/profile',
        '/api/users',
        '/api/groups',
        '/api/subjects'
    ],
    admin: [
        '/api/auth', 
        '/api/profile',
        '/api/users',
        '/api/groups',
        '/api/subjects'
    ],
    teacher: [
        '/api/auth', 
        '/api/profile',
        '/api/groups',
        '/api/subjects'
    ],
    students: ['/api/auth', '/api/profile']
}