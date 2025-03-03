import bcrypt from 'bcrypt';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
const jwtSign = promisify(jwt.sign);
import User from '../models/User.js';
import { SECRET, SALT_ROUNDS } from '../../config/constants.js';

const normalizePhoneNumber = (phone) => {
    let normalizedPhone = phone.replace(/\D/g, '');

    if (normalizedPhone.startsWith('08')) {
        normalizedPhone = '+359' + normalizedPhone.slice(1);
    }

    if (normalizedPhone.startsWith('+359')) {
        return normalizedPhone;
    }

    return normalizedPhone;
};


export const registerUser = async (userData) => {
    const userReg = await User.findOne({ email: userData.email });
    const userPhone = await User.findOne({ phone: normalizePhoneNumber(userData.phone) });

    if (userPhone?.phone === normalizePhoneNumber(userData.phone)) {
        throw {
            message: 'Потребител с този номер вече съществува!'
        }
    }

    if (userReg) {
        throw {
            message: 'Потребител с този имейл, вече съществува!',
        }
    } else {
        try {
            if (!Object.values(userData).some(x => x == '')) {
                const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
                const user = await User.create({
                    ...userData,
                    password: hashedPassword,
                    phone: normalizePhoneNumber(userData.phone),
                    isVerified: false,
                    isDeleted: false,
                    role: 'user',
                    followers: [],
                    following: []
                });

                return user;
            } else {
                throw {
                    message: 'Ivalid user data provided!'
                }
            }
        } catch (err) {
            return err;
        }
    }
}

export const loginUser = async ({ email, password }) => {
    try {
        const user = await User.findOne({ email });
        const isValid = await bcrypt.compare(password, user.password);

        if (!user.isVerified) {
            throw {
                message: 'Вашият имейл не е потвърден! Моля, проверете пощата си.'
            };
        }


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
    const token = jwtSign({ _id: user._id, email: user.email, role: user.role }, SECRET, { expiresIn: '2d' });
    return token;
}

export const getUserData = async (userEmail) => {
    const user = await User.findOne({ email: userEmail });

    if (user) {
        return user;
    } else {
        return 'User not found!';
    }
}

export const sendVerificationEmail = async (userData, verificationLink) => {
    const SERVICE_ID = 'service_m5m75hf';
    const TEMPLATE_ID = 'template_aquu3g9';
    const PUBLIC_KEY = 'LTHT5SFyCsSE4GRm5';
    const ACCESS_TOKEN = '7qrA_ZxWmHTbEksk44nge';

    const templateParams = {
        to_email: userData.email,
        to_firstName: userData.firstName,
        to_lastName: userData.lastName,
        to_link: verificationLink,
    };

    try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                service_id: SERVICE_ID,
                template_id: TEMPLATE_ID,
                user_id: PUBLIC_KEY,
                accessToken: ACCESS_TOKEN,
                template_params: templateParams
            })
        });

        if (!response.ok) {
            throw new Error('Неуспешно изпращане на имейл за потвърждение.');
        }

        console.log('Имейл за потвърждение изпратен успешно!');
    } catch (error) {
        console.error('Грешка при изпращане на имейл:', error.message);
    }
};
