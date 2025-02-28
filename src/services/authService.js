import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
const jwtSign = promisify(jwt.sign);
import User from '../models/User.js';
import { SECRET, SALT_ROUNDS } from '../../config/constants.js';

export const registerUser = async (userData) => {
    const userReg = await User.findOne({ email: userData.email });
    console.log(userReg);
    
    if (userReg) {
        throw {
            message: 'User with this email already exists!',
        }
    } else {
        try {
            if (!Object.values(userData).some(x => x == '')) {
                const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
                const user = await User.create({ ...userData, password: hashedPassword });
                console.log(user);
                
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

        if (isValid) {
            return user;
        } else {
            throw {
                message: 'Invalid email or password!'
            }
        }
    } catch (err) {
        return err.message;
    }
}

export const generateToken = async (user) => {
    const token = jwtSign({ _id: user._id, email: user.email }, SECRET, { expiresIn: '2d' });
    return token;
}