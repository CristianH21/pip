"use strict";

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/user.model');
const { userLogin, getUserAuth, updatePassword } = require('../config/db.config');

const login = async (req, res) => {
    const { userNumber, password } = req.body;

    let user = new User({userNumber, password});

    try {

        const loginRes = await userLogin(user);

        if (loginRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'Datos invalidos.'}]
            });
        }
        
        const match = await isMatch(password, loginRes.rows[0].password);

        if (!match) {
            return res.status(400).json({
                errors: [{ msg: 'Datos invalidos.'}]
            });
        }
        
        const payload = {
            user: {
                userId: loginRes.rows[0].id,
                role: loginRes.rows[0].role
            }
        }

        jwt.sign( 
            payload, 
            config.get('jwtSecret'),
            { expiresIn: 360000},
            ( err, token) => {
                if (err) throw err
                res.status(201).json({
                    status: 200,
                    message: 'User logged in',
                    token: token
                });
            });

    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    }

};

const authUser = async (req, res) => {

    const { userId } = req.user;

    try {
        const authRes = await getUserAuth(userId);
        
        if (authRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'Invalid Auth.'}]
            })
        }

        res.status(200).json({
            status: 200,
            message: 'Auth',
            user: authRes.rows[0]
        });
    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    }
}

const changePassword = async (req, res) => {
    
    const { userId } = req.user;
    const { password } = req.body;

    console.log('password: ', password)

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    try {

        const authRes = await updatePassword(userId, hash);

        if (authRes.rowCount == 0) {
            return res.status(400).json({
                errors: [{ msg: 'La contraseña no se actualizó, intente nuevamente más tarde.'}]
            })
        }

        res.status(200).json({
            status: 200,
            message: 'Auth',
            user: authRes.rows[0]
        });
        
    } catch (error) {
        res.status(400).json({
            errors: [{ msg: error.message}]
        });
    }
}

const isMatch = (password, hashPassword) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hashPassword, (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
}

module.exports = {
    login,
    authUser,
    changePassword
}

