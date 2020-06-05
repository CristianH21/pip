"use strict";

const { getSubjects, addSubject, getSubjectById, updateSubject, delSubject } = require('../config/db.config');

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
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    }
}

const putSubject = async (req, res) => {

    const { data } = req.body;
    const { subjectId } = req.params;

    try { 
        const userRes = await updateSubject(data, subjectId);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se modifico la materia, por favor intentelo más tarde.'}]
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Materia modificada.',
            result: userRes.rows
        });
    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    }
}

const deleteSubject = async (req, res) => {

    const { subjectId } = req.params;

    try { 
        const userRes = await delSubject(subjectId);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se elimino la materia, por favor intentelo más tarde.'}]
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Materia eliminada.',
            result: userRes.rows
        });
    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    }
}

const fetchSubjectById = async (req, res) => {
    
    const { subjectId } = req.params;

    try { 
        const userRes = await getSubjectById(subjectId);

        if (userRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se encontro la materia, por favor intentelo más tarde.'}]
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Materia encontrada.',
            result: userRes.rows
        });
    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    }

}


module.exports = {
    getAllSubjects,
    createSubject,
    fetchSubjectById,
    putSubject,
    deleteSubject
}