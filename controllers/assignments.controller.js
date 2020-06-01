"use strict";

const { getAssignmentById } = require('../config/db.config');

const fetchAssignmentById = async (req, res) => {
    
    const { id } = req.params;

    try {     
        const userRes = await getAssignmentById(id);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'Hubo un problema en mostrar la asignación, por favor intentelo más tarde.'}]
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Asignación fue encontrada.',
            result: userRes.rows[0]
        });
    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    }
}

module.exports = {
    fetchAssignmentById
}