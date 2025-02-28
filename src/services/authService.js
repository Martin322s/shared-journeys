import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
const jwtSign = promisify(jwt.sign);
import User from '../models/User';
import { SECRET, SALT_ROUNDS } from '../../config/constants';

export const registerUser = async ({ email, password, gender }) => {
    const userReg = await User.findOne({ email });
    if (userReg) {
        throw {
            message: 'Email already registered!'
        }
    } else {
        try {
            if (email !== '' || password !== '' || gender !== '') {
                const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
                const user = await User.create({ email, password: hashedPassword, gender });
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