import express from 'express';
import User from '../models/User.js';
import { getAll } from '../services/tripService.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const users = await User.find().lean();
    const roads = await getAll();
    res.render('index', { layout: 'main', usersCount: users.length, roadsCount: roads.length });
});

router.get('/admin', (req, res) => {
    res.render('admin', { layout: 'admin' });
});

export default router;