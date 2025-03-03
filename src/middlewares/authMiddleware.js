import jwt from 'jsonwebtoken';
import { promisify } from 'util';
const jwtVerify = promisify(jwt.verify);
import { SECRET } from '../../config/constants.js';

export const auth = async (req, res, next) => {
    try {
        const token = req.cookies['session'];

        if (!token) {
            if (req.path !== '/users/login') {
                return res.redirect('/users/login');
            }
            return next();
        }

        const decodedToken = await jwtVerify(token, SECRET);

        if (decodedToken.role === 'admin') {
            res.locals.admin = decodedToken.role;
        }

        req.user = decodedToken._id;
        req.email = decodedToken.email;
        res.locals.email = decodedToken.email;
        res.locals.user = decodedToken._id;
        return next();

    } catch (err) {
        console.error('Auth Error:', err.message);

        if (err.message === 'jwt expired') {
            res.clearCookie('session');
            res.locals.err = 'asd'

            if (req.path !== '/users/login') {
                return res.redirect(`/users/login?error=${err.message}`);
            }
        }

        return next();
    }
};



export const privateGuardUser = (req, res, next) => {
    if (req.user) {
        res.redirect('/');
    } else {
        next();
    }
}

export const privateGuardGuest = (req, res, next) => {
    if (!req.user) {
        res.redirect('/users/login');
    } else {
        next();
    }
}