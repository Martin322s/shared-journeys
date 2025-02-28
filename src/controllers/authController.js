import express from 'express';
import { generateToken, getUserData, loginUser, registerUser, sendVerificationEmail } from '../services/authService.js';
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

router.get('/login', privateGuardUser, (req, res) => {
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
    try {
        const allowedImageFormats = ['image/jpeg', 'image/jpg', 'image/png'];

        if (Object.values(req.body).some(x => x == '')) {
            throw {
                message: 'Всички полета са задължителни!'
            }
        }

        const profilePicture = req.files.profilePicture;

        if (!allowedImageFormats.includes(profilePicture.mimetype)) {
            throw {
                message: 'Невалиден формат на снимката'
            }
        }

        const base64Image = profilePicture.data.toString('base64');
        const imageWithPrefix = `data:${profilePicture.mimetype};base64,${base64Image}`;

        const userData = {
            ...req.body,
            profilePicture: imageWithPrefix
        }

        const emailRegex = new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
        if (!emailRegex.test(userData.email)) {
            throw {
                message: 'Моля, въведете валиден имейл адрес!'
            }
        }

        if (userData.password !== userData.repeatPassword) {
            throw {
                message: 'Паролите не съвпадат. Моля, въведете ги отново!'
            }
        }

        if (userData.password.length < 8 || userData.repeatPassword.length < 8) {
            throw {
                message: 'Паролата трябва да е с дължина минимум 8 символа!'
            }
        }

        const phoneRegex = new RegExp('^\\s*0\\s*8\\s*[0-9\\s]{8,15}$');

        if (!phoneRegex.test(userData.phone)) {
            throw {
                message: 'Моля, въведете валиден български телефонен номер (10 цифри, започващ с 08)!'
            }
        }

        const user = await registerUser(userData);

        if (!user.message) {
            const verificationLink = `http://localhost:5000/users/verify-email?email=${user.email}`;
            await sendVerificationEmail(user, verificationLink);
            res.render('login', {
                layout: 'login',
                error: { message: 'Регистрацията е успешна! Моля, проверете вашия имейл за потвърждение.' }
            })
        } else {
            throw user;
        }
    } catch (error) {
        res.render('register', { layout: 'register', error: { message: error.message } });
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

router.get('/verify-email', async (req, res) => {
    const { email } = req.query;

    try {
        const user = await getUserData(email);

        if (!user.email) {
            throw new Error('Невалиден имейл за потвърждение.');
        }

        user.isVerified = true;
        await user.save();

        res.render('login', {
            layout: 'login',
            error: { message: 'Вашият имейл беше потвърден успешно! Може да влезете в профила си.' }
        });
    } catch (error) {
        res.render('login', {
            layout: 'login',
            error: { message: 'Линкът за потвърждение е невалиден или е изтекъл!' }
        });
    }
});

export default router;