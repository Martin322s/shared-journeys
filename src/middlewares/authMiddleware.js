import jwt from 'jsonwebtoken';
import { promisify } from 'util'; 
const jwtVerify = promisify(jwt.verify);
import { SECRET } from '../../config/constants.js';

export const auth = async (req, res, next) => {
    const token = req.cookies['session'];

    if (token) {
        const decodedToken = await jwtVerify(token, SECRET);
        req.user = decodedToken._id;
        req.email = decodedToken.email;
        res.locals.email = decodedToken.email;
        res.locals.user = decodedToken._id;
        next();
    } else {
        next();
    }
}