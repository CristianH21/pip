"use strict";

const { getGroups, addGroup } = require('../config/db.config');

const getAllGroups = async (req, res) => {

    try {

        const userRes = await getGroups();

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se encontro datos de grupos.'}]
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Todos los grupos.',
            result: userRes.rows
        });
        
    } catch (error) {
        console.log('Error en obtener grupos.', error);
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    }
}

const createGroup = async (req, res) => {

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
    getAllGroups,
    createGroup
}