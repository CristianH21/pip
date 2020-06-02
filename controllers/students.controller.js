"use strict";

const { getSubjectsByStudent, getClasswork } = require('../config/db.config');
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

const uploadAssignment = async (req, res) => {

    const { data } = req.body;
    var fileBuffer = Buffer.from(data.fileName, 'base64');
    data.buffer = fileBuffer;
    
    try {
        const s3 = await awsS3.sign_s3_v2(data);
        console.log('s3 response: ', s3);
    } catch (error) {
        console.error(error);
    }

    
}

module.exports = {
    fetchSubjectsByStudent,
    fecthClasswork,
    uploadAssignment
}