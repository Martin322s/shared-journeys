import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
const jwtSign = promisify(jwt.sign);
import User from '../models/User.js';
import { SECRET, SALT_ROUNDS } from '../../config/constants.js';

export const registerUser = async (userData) => {
    const userReg = await User.findOne({ email: userData.email });
    
    if (userReg) {
        throw {
            message: 'User with this email already exists!',
        }
    } else {
        try {
            if (!Object.values(userData).some(x => x == '')) {
                const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
                const user = await User.create({ ...userData, password: hashedPassword });
                
                return user;
            } else {
                throw {
                    message: 'Ivalid user data provided!'
                }
            }
        } catch (err) {
            return err.message;
        }
    }
}

export const loginUser = async ({ email, password }) => {
    try {
        const user = await User.findOne({ email });
        const isValid = await bcrypt.compare(password, user.password);

        console.log(isValid);
        

        if (isValid) {
            return user;
        } else {
            throw {
                message: 'Невалиден имейл или парола!'
            }
        }
    } catch (err) {
        return err;
    }
}

export const generateToken = async (user) => {
    const token = jwtSign({ _id: user._id, email: user.email }, SECRET, { expiresIn: '2d' });
    return token;
}

export const getUserData = async (userEmail) => {
    const user = await User.findOne({ email: userEmail });

    if (user) {
        return user;
    } else {
        return 'User bot found!';
    }
}