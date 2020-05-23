"use strict";
const { getStudents, addStudent, getTeachers, addTeacher, getStaff } = require('../config/db.config');

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
    getAllTeachers,
    createTeacher,
    getAllStaff
}