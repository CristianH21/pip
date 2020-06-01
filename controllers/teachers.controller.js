"use strict";

const { getSubjectsByTeacher, addPeriod, getClasswork, addAssignment} = require('../config/db.config');

const fetchSubjectsByTeacher = async (req, res) => {

    const { id } = req.params;

    try {     
        const userRes = await getSubjectsByTeacher(id);

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

const createPeriod = async (req, res) => {

    const { id } = req.params;
    const { data } = req.body;

    try {     
        const userRes = await addPeriod(id, data);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'Hubo un problema en mostrar las materias, por favor intentelo más tarde.'}]
            });
        }

        res.status(201).json({
            status: 201,
            message: 'Periodo fue creado.',
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

const createAssignment = async (req, res) => {
    
    const { periodId } = req.params;
    const { data } = req.body;

    try {     
        const userRes = await addAssignment(periodId, data);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'Hubo un problema en mostrar las materias, por favor intentelo más tarde.'}]
            });
        }

        res.status(201).json({
            status: 201,
            message: 'Asignación fue creada.',
            result: userRes.rows
        });
    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    }
}

module.exports = {
    fetchSubjectsByTeacher,
    createPeriod,
    fecthClasswork,
    createAssignment
}