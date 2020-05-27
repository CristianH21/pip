module.exports = {
    superadmin: [
        '/api/auth', 
        '/api/profile',
        '/api/users',
        '/api/groups',
        '/api/subjects',
        '/api/classrooms'
    ],
    admin: [
        '/api/auth', 
        '/api/profile',
        '/api/users',
        '/api/groups',
        '/api/subjects',
        '/api/classrooms'
    ],
    teacher: [
        '/api/auth', 
        '/api/profile',
        '/api/groups',
        '/api/subjects'
    ],
    student: ['/api/auth', '/api/profile']
}