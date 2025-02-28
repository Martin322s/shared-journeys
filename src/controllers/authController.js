import express from 'express';
import { generateToken, getUserData, loginUser, registerUser } from '../services/authService.js';
import { privateGuardGuest, privateGuardUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

function containsOnlySpaces(password) {
    const onlySpacesRegex = /^\s+$/;

    if (onlySpacesRegex.test(password)) {
        return true;
    } else {
        return false;
    }
}

router.get('/login', privateGuardUser,  (req, res) => {
    res.render('login', { layout: 'login' });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        if ((email && password) && (email !== '' && password !== '')) {
            const emailRegex = new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');

            if (email && !emailRegex.test(email)) {
                throw {
                    message: 'Моля, въведете валиден имейл адрес!'
                }
            }

            if (containsOnlySpaces(password)) {
                throw {
                    message: 'Невалидна парола! Съдържа само интервали.',
                }
            }

            if (password.length < 8) {
                throw {
                    message: 'Паролата трябва да е с дължина минимум 8 символа!'
                }
            }

            if (password && password.includes('script')) {
                throw {
                    message: 'Не валиден имейл или парола!'
                }
            }

            const user = await loginUser({ email, password });


            if (!user?.message) {
                const token = await generateToken(user);
                res.cookie('session', token, { httpOnly: true });
                res.redirect('/');
            } else {
                throw user;
            }
        } else {
            throw {
                message: 'Всички полета са задължителни!'
            }
        }
    } catch (err) {
        res.render('login', { layout: 'login', error: { message: err.message } });
    }
});

router.get('/register', privateGuardUser, (req, res) => {
    res.render('register', { layout: 'register' })
});

router.post('/register', async (req, res) => {
    const profilePicture = req.files.profilePicture;
    const base64Image = profilePicture.data.toString('base64');
    const imageWithPrefix = `data:${profilePicture.mimetype};base64,${base64Image}`;

    const userData = {
        ...req.body,
        profilePicture: imageWithPrefix
    }

    try {
        if (userData.password == '' || userData.repeatPassword == '' && (userData.password || userData.repeatPassword)) {
            throw {
                message: 'Passwords missmatch detected!'
            }
        } else {
            const user = await registerUser(userData);
            const token = await generateToken(user);
            res.cookie('session', token, { httpOnly: true });
            res.redirect('/');
        }
    } catch (error) {
        res.render('register', { layout: 'register' });
    }
});

router.get('/logout', privateGuardGuest, (req, res) => {
    res.clearCookie('session');
    res.redirect('/');
});

router.get('/profile', privateGuardGuest, async (req, res) => {
    const email = res.locals.email;
    const userData = await getUserData(email);

    res.render('profile', {
        layout: 'profile',
        user: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            profilePicture: userData.profilePicture,
            phone: userData.phone,
            tripsSubscribedHistory: userData.tripsSubscribedHistory,
            tripsSharedHistory: userData.tripsSharedHistory,
            createdAt: userData.formattedDate
        }
    });
});

export default router;