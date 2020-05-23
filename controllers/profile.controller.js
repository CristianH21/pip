"use strict";
const { getProfileByUserId, updateProfile } = require('../config/db.config');

const getProfile = async (req, res) => {
    
    const { userId } = req.user;

    try {
        const profileRes = await getProfileByUserId(userId);

        if (profileRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se encontro datos del usuario.'}]
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Datos del usuario',
            result: profileRes.rows[0]
        });

    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    }
};

const editProfile = async (req, res) => {
    
    const { userId } = req.user;
    const { formData, userType, profileType } = req.body;

    try {
        const profileRes = await updateProfile(userId, formData, userType, profileType);

        if (profileRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'No se actualizo datos del usuario.'}]
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Datos actualizados'
        });

    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    }
}

module.exports = {
    getProfile,
    editProfile
}