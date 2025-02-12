import express from 'express';

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('login', { layout: 'login' });
});

router.get('/register', (req, res) => {
    res.render('register', { layout: 'register' });
});

router.get('/profile', (req, res) => {
    res.render('profile', { layout: 'profile' });
});

export default router;