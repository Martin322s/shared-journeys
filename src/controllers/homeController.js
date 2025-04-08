import express from 'express';
import User from '../models/User.js';
import { getAll } from '../services/tripService.js';
import Trip from '../models/Trip.js';
import Challenge from '../models/Challenge.js';

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
	const challenges = await Challenge.find().lean();
	res.render('admin', {
		layout: 'admin',
		usersCount: users.length,
		deletedUsersCount: deletedUsers.length,
		tripsCount: trips.length,
		users: users.filter(x => x.isDeleted == false && x._id != req.user),
		deletedUsers,
		trips,
		challengesCount: challenges.length
	});
});

router.get('/admin/create-challenge', (req, res) => {
	res.render('create-challenge', { layout: 'create-challenge' });
});

router.post('/admin/create-challenge', async (req, res) => {
	try {
		const {
			title,
			description,
			reward,
			points,
			status,
			goal,
			target,
			startDate,
			endDate
		} = req.body;

		if (!title || !description || !reward || !points || !status || !goal || !target || !startDate || !endDate) {
			return res.status(400).send('Всички задължителни полета трябва да са попълнени.');
		}

		const challenge = new Challenge({
			title,
			description,
			reward,
			points: Number(points),
			status,
			goal,
			target: Number(target),
			startDate: new Date(startDate),
			endDate: new Date(endDate)
		});

		await challenge.save();

		res.redirect('/roads/challenges');
	} catch (err) {
		console.error('Грешка при създаване на предизвикателство:', err);
		res.status(500).send('Възникна грешка при създаването на предизвикателството.');
	}
});

export default router;