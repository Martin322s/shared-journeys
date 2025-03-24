import express from 'express';
import User from '../models/User.js';
import { getAll } from '../services/tripService.js';
import Trip from '../models/Trip.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const users = await User.find().lean();
    const roads = await getAll();
    res.render('index', { layout: 'main', usersCount: users.length, roadsCount: roads.length });
});

router.get('/admin', async (req, res) => {
    const users = await User.find().lean();
    const deletedUsers = users.filter(x => x.isDeleted == true);
    const trips = await Trip.find().lean().populate('_ownerId');
    res.render('admin', { 
        layout: 'admin', 
        usersCount: users.length, 
        deletedUsersCount: deletedUsers.length,
        tripsCount: trips.length,
        users: users.filter(x => x.isDeleted == false && x._id != req.user),
        deletedUsers,
        trips
    });
});

export default router;