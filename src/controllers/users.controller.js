"use strict";

const logger = require('../config/logger.config');
const bcrypt = require('bcryptjs');
const { 
    getStudents, addStudent, getStudentById, updateStudent, delStudent,
    getTeachers, addTeacher, getTeacherById, updateTeacher, delTeacher, getStaff 
} = require('../config/db.config');

const getAllStudents = async (req, res) => {

    const { userId } = req.user;

    try {

        const userRes = await getStudents(userId);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se encontro datos del usuario.'}]
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Todos los estudantes.',
            result: userRes.rows
        });
        
    } catch (error) {
        console.log('Error in get student controller', error);
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    }
}

const createStudent = async (req, res) => {

    const { data } = req.body;

    const salt = bcrypt.genSaltSync(10);
    data['hash'] = bcrypt.hashSync(data.password, salt);

    try {
        const userRes = await addStudent(data);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se encontro datos del usuario.'}]
            });
        }

        res.status(201).json({
            status: 201,
            message: 'Estudiante ha sido creado.',
            result: userRes.rows
        });

    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    } 
}

const fetchStudentById = async (req, res) => {

    const { studentId } = req.params;
    
    try {
        const userRes = await getStudentById(studentId);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se encontro datos del estudiante.'}]
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Estudiante encontrado.',
            result: userRes.rows
        });

    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    } 

}

const putStudent = async (req, res) => {
    const { studentId } = req.params;
    const { data } = req.body;

    try {
        const userRes = await updateStudent(data, studentId);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se modifico datos del estudiante.'}]
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Estudiante se modificado.',
            result: userRes.rows
        });

    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    } 
}

const deleteStudent = async (req, res) => {

    const { studentId } = req.params;

    try {
        const userRes = await delStudent(studentId);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se elimino datos del estudiante.'}]
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Estudiante fue eliminado.',
            result: userRes.rows
        });

    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    } 
}

const getAllTeachers = async (req, res) => {
    
    const { userId } = req.user;

    try {
        const userRes = await getTeachers(userId);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se encontro datos del usuario.'}]
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Todos los docentes.',
            result: userRes.rows
        });

    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    } 
}

const createTeacher = async (req, res) => {

    const { data } = req.body;

    const salt = bcrypt.genSaltSync(10);
    data['hash'] = bcrypt.hashSync(data.password, salt);

    try {
        const userRes = await addTeacher(data);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se pudo crear usuario.'}]
            });
        }

        res.status(201).json({
            status: 201,
            message: 'Docente ha sido creado.',
            result: userRes.rows
        });

    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    } 
}

const fetchTeacherById = async (req, res) => {
    
    const { teacherId } = req.params;
    
    try {
        const userRes = await getTeacherById(teacherId);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se encontro datos del docente.'}]
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Docente encontrado.',
            result: userRes.rows
        });

    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    } 
}

const putTeacher = async (req, res) => {
    const { teacherId } = req.params;
    const { data } = req.body;

    try {
        const userRes = await updateTeacher(data, teacherId);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se modifico datos del docente.'}]
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Docente se modificado.',
            result: userRes.rows
        });

    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    } 
}

const deleteTeacher = async (req, res) => {
    
    const { teacherId } = req.params;

    try {
        const userRes = await delTeacher(teacherId);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se elimino datos del docente.'}]
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Docente fue eliminado.',
            result: userRes.rows
        });

    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    } 
}

const getAllStaff = async (req, res) => {

    try {
        const userRes = await getStaff();

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se encontro datos del usuario.'}]
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Todos los emplados.',
            result: userRes.rows
        });

    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    } 
}

module.exports = {
    getAllStudents,
    createStudent,
    fetchStudentById,
    putStudent,
    deleteStudent,
    getAllTeachers,
    createTeacher,
    fetchTeacherById,
    putTeacher,
    deleteTeacher,
    getAllStaff
}