"use strict";

const { getClassrooms } = require('../config/db.config');

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
        
        const userRes = await addGroup(data);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se creo el grupo, por favor intentelo más tarde.'}]
            });
        }

        res.status(201).json({
            status: 201,
            message: 'Grupo ha sido creada.',
            result: userRes.rows
        });
    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    }
}

module.exports = {
    getAllClassrooms,
    createClassroom
}