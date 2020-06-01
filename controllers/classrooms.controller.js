"use strict";

const { 
    getClassrooms,
    addClassroom,
    getClassroomById,
    updateClassroom,
    updateClassroomStudents,
    updateClassroomSubjects
} = require('../config/db.config');

const getAllClassrooms = async (req, res) => {

    try {

        const userRes = await getClassrooms();

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se encontro datos de classroom.'}]
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Todos los classrooms.',
            result: userRes.rows
        });
        
    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    }
}

const createClassroom = async (req, res) => {

    const { data } = req.body;

    try {
        
        const userRes = await addClassroom(data);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se creo classroom, por favor intentelo más tarde.'}]
            });
        }

        console.log('Creating classroom', data);

        res.status(201).json({
            status: 201,
            message: 'Classroom ha sido creado.',
            result: userRes.rows
        });
    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    }
}

const oneClassroomById = async (req, res) => {
    const { id } = req.params;

    try {
        
        const userRes = await getClassroomById(id);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se encontro classroom, por favor intentelo más tarde.'}]
            });
        }

        console.log('Data returned: ', userRes.rows);

        res.status(200).json({
            status: 200,
            message: 'Classroom.',
            result: userRes.rows
        });
    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    }
}

const updateClassroomById = async (req, res) => {

    const { data } = req.body;

    try {
        
        const userRes = await updateClassroom(data);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se modificó classroom, por favor intentelo más tarde.'}]
            });
        }

        console.log('Data returned: ', userRes.rows);

        res.status(200).json({
            status: 200,
            message: 'Classroom.',
            result: userRes.rows
        });

    } catch (error) {
        
    }
    
}

const updateClassroomByStudents = async (req, res) => {

    const { data } = req.body;

    try {
        
        const userRes = await updateClassroomStudents(data);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se modificó classroom, por favor intentelo más tarde.'}]
            });
        }

        console.log('Data returned: ', userRes.rows);

        res.status(200).json({
            status: 200,
            message: 'Classroom.',
            result: userRes.rows
        });

    } catch (error) {
        
    }
    
}

const updateClassroomBySubjects = async (req, res) => {
    
    const { data } = req.body;

    try {
        
        const userRes = await updateClassroomSubjects(data);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se modificó classroom, por favor intentelo más tarde.'}]
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Classroom.',
            result: userRes.rows
        });

    } catch (error) {
        
    }
}

module.exports = {
    getAllClassrooms,
    createClassroom,
    oneClassroomById,
    updateClassroomById,
    updateClassroomByStudents,
    updateClassroomBySubjects
}