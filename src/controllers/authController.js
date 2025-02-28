import express from 'express';
import { generateToken, registerUser } from '../services/authService.js';

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('login', { layout: 'login' });
});

router.get('/register', (req, res) => {
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

router.get('/logout', (req, res) => {
    res.clearCookie('session');
    res.redirect('/');
});

router.get('/profile', (req, res) => {
    res.render('profile', { layout: 'profile' });
});

export default router;