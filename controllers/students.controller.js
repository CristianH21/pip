"use strict";

const { getSubjectsByStudent, getClasswork } = require('../config/db.config');

const fetchSubjectsByStudent = async (req, res) => {

    const { id } = req.params;

    try {     
        const userRes = await getSubjectsByStudent(id);

        console.log('got back: ', userRes.rows);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'Hubo un problema en mostrar las materias, por favor intentelo más tarde.'}]
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Materias.',
            result: userRes.rows
        });
    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    }
}

const fecthClasswork = async (req, res) => {

    const { id } = req.params;

    try {     
        const userRes = await getClasswork(id);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'Hubo un problema en mostrar las actividades, por favor intentelo más tarde.'}]
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Classwork.',
            result: userRes.rows
        });
    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    }
}

module.exports = {
    fetchSubjectsByStudent,
    fecthClasswork
}