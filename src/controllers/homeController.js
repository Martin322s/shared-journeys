import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const users = await User.find().lean();
    res.render('index', { layout: 'main', usersCount: users.length });
});

router.get('/admin', (req, res) => {
    res.render('admin', { layout: 'admin' });
});

export default router;