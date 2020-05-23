module.exports = {
    admin: ['/api/auth', '/api/profile','/api/users'],
    teacher: [
        '/api/auth', 
        '/api/profile',
        '/api/users',
        '/api/groups',
        '/api/subjects'
    ],
    students: ['/api/auth', '/api/profile']
}