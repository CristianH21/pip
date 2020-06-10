const jwt = require('jsonwebtoken');
const roles = require('../config/roles.config')
require('dotenv').config();

module.exports = (req, res, next) => {
    const token = req.header('x-auth-token');
    
    if (!token) {
        return res.status(401).json({
            errors: [{ msg: 'No token, authorization denied.'}]
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.jwtSecret);

        if (roles[decoded.user.role].find( url => { return url === req.baseUrl })) {
            req.user = decoded.user;
            next();
        } else {
            return res.status(401).json({
                errors: [{ msg: 'Acceso denegado: no tiene el privilegio correcto para realizar esta operación.'}]
            });
        }
        

    } catch (error) {
        res.status(401).json({
            errors: [{ msg: 'Token is not valid.'}]
        })
    }
}