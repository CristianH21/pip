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
        '/api/teachers',
        '/api/assignments'
    ],
    student: [
        '/api/auth', 
        '/api/profile',
        '/api/students',
        '/api/assignments'
    ]
}