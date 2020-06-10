"use strict";

const logger = require('../config/logger.config');
const { getSubjectsByStudent, getClassworkByStudent, addStudentAssignment } = require('../config/db.config');
const awsS3 = require('../config/aws.config');

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
        const userRes = await getClassworkByStudent(id);

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

const uploadAssignment = async (req, res) => {

    const { file } = req.files;
    const { comment } = req.body;
    const { studentId, assignmentId } = req.params;

    
    try {
        const s3 = await awsS3.sign_s3_v2(file);
        const userRes = await addStudentAssignment(studentId, assignmentId, file, s3.Location, comment);

        res.status(200).json({
            status: 200,
            message: 'Assignment uploaded.',
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
    fecthClasswork,
    uploadAssignment
}