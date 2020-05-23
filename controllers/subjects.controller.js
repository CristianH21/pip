"use strict";

const { getSubjects, addSubject } = require('../config/db.config');

const getAllSubjects = async (req, res) => {

    try {

        const userRes = await getSubjects();

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se encontro datos de materias.'}]
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Todos las materias.',
            result: userRes.rows
        });
        
    } catch (error) {
        console.log('Error in get subjects.', error);
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    }
}

const createSubject = async (req, res) => {

    const { data } = req.body;

    try {
        
        const userRes = await addSubject(data);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se creo la materia, por favor intentelo más tarde.'}]
            });
        }

        res.status(201).json({
            status: 201,
            message: 'Materia ha sido creada.',
            result: userRes.rows
        });
    } catch (error) {
        
    }
}

module.exports = {
    getAllSubjects,
    createSubject
}