import express from 'express';
import { addOffer, createTrip, editTrip, getAll, getAllPassagers, getOne } from '../services/tripService.js';
import { getUserData } from '../services/authService.js';
import Trip from '../models/Trip.js';
import User from '../models/User.js';
import Challenge from '../models/Challenge.js';
import UserChallenge from '../models/User-Challenge.js';

const router = express.Router();

function isDatePassed(dateString) {
	const inputDate = new Date(dateString);
	const currentDate = new Date();
	return inputDate < currentDate;
}

router.get('/road-offers', async (req, res) => {
	const roadOffers = await getAll();
	const roads = roadOffers
		.map(x => ({ ...x, email: req.email }))
		.filter(x => x.isDeleted == false && x.isFinished == false);
	res.render('road-offers', { layout: 'roads', roadOffers: roads });
});

router.get('/about', (req, res) => {
	res.render('about', { layout: 'about' });
});

router.get('/contacts', (req, res) => {
	res.render('contacts', { layout: 'contacts' });
});

router.post('/contacts', async (req, res) => {
	const { name, email, subject, message } = req.body;

	const SERVICE_ID = 'service_m5m75hf';
	const TEMPLATE_ID = 'template_41v8civ';
	const PUBLIC_KEY = 'LTHT5SFyCsSE4GRm5';
	const ACCESS_TOKEN = '7qrA_ZxWmHTbEksk44nge';

	const templateParams = {
		to_email: email,
		to_name: name,
		to_subject: subject,
		to_message: message,
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
			throw new Error('Неуспешно изпращане на имейл.');
		}

		console.log('Имейл, изпратен успешно!');
	} catch (error) {
		console.error('Грешка при изпращане на имейл:', error.message);
	}

	res.redirect('/roads/contacts');

});

router.get('/journey-offer', (req, res) => {
	res.render('trip-create', { layout: 'trip-create' });
});

router.post('/journey-offer', async (req, res) => {
	try {
		const allowedImageFormats = ['image/jpeg', 'image/jpg', 'image/png'];

		if (Object.values(req.body).some(x => x == '')) {
			throw {
				message: 'Всички полета са задължителни!'
			}
		}

		if (isDatePassed(req.body.date)) {
			throw {
				message: 'Избраната дата, вече е отминала. Моля, изберете нова!'
			}
		}

		if (req.body.seats <= 0 || req.body.price < 0) {
			throw {
				message: 'Невалида стойност при свободните места или таксата за пътуване!'
			}
		}

		if (req.files == null) {
			throw {
				message: 'Моля, изберете изображение на автомобила!'
			}
		}

		const carImage = req.files.carImage;

		if (!allowedImageFormats.includes(carImage.mimetype)) {
			throw {
				message: 'Невалиден формат на снимката!'
			}
		}

		const base64Image = carImage.data.toString('base64');
		const imageWithPrefix = `data:${carImage.mimetype};base64,${base64Image}`;
		const _ownerId = req.user;

		const roadData = { ...req.body, carImage: imageWithPrefix, _ownerId, buddies: [] };

		const newTrip = await createTrip(roadData);
		await addOffer(newTrip, req.user);

		const driver = await User.findById(req.user);
		driver.points += 5;
		await driver.save();
		res.redirect('/roads/road-offers');
	} catch (err) {
		res.render('trip-create', { layout: 'trip-create', error: { message: err.message } });
	}
});

router.get('/offer-details/:offerId', async (req, res) => {
	const offerId = req.params.offerId;
	const offerDetails = await getOne(offerId);
	const passagers = await getAllPassagers(offerId);

	res.render('details', {
		layout: 'details',
		offerDetails, isOwner: req.user == offerDetails._ownerId.id,
		noSeats: offerDetails.seats == 0 && !offerDetails.buddies.includes(req.user),
		hasJoined: offerDetails.buddies.includes(req.user),
		availableSeats: offerDetails.seats > 0 && !offerDetails.buddies.includes(req.user),
		buddies: passagers.buddies
	});
});

router.get('/edit-offer/:offerId', async (req, res) => {
	const offer = await Trip.findById(req.params.offerId);
	res.render('trip-edit', { layout: 'trip-edit', offer });
});

router.post('/edit-offer/:offerId', async (req, res) => {
	try {
		const offerId = req.params.offerId;
		const offer = await Trip.findById(offerId);

		if (!offer) {
			throw { message: 'Пътуването не беше намерено!' };
		}

		const allowedImageFormats = ['image/jpeg', 'image/jpg', 'image/png'];

		if (isDatePassed(req.body.date)) {
			throw { message: 'Избраната дата, вече е отминала. Моля, изберете нова!' };
		}

		if (req.body.seats <= 0 || req.body.price < 0) {
			throw { message: 'Невалидна стойност при свободните места или таксата за пътуване!' };
		}

		let imageWithPrefix;

		if (req.files?.carImage && req.files.carImage.size > 0) {
			const carImage = req.files.carImage;

			if (!allowedImageFormats.includes(carImage.mimetype)) {
				throw { message: 'Невалиден формат на снимката!' };
			}

			const base64Image = carImage.data.toString('base64');
			imageWithPrefix = `data:${carImage.mimetype};base64,${base64Image}`;
		}

		offer.startPoint = req.body.startPoint;
		offer.endPoint = req.body.endPoint;
		offer.date = req.body.date;
		offer.time = req.body.time;
		offer.carBrand = req.body.carBrand;
		offer.seats = req.body.seats;
		offer.price = req.body.price;
		offer.description = req.body.description;
		offer.carImage = imageWithPrefix ? imageWithPrefix : offer.carImage;

		await offer.save();

		res.redirect(`/roads/offer-details/${offerId}`);
	} catch (err) {
		console.log(err);

		const offer = await Trip.findById(req.params.offerId);
		res.render('trip-edit', {
			layout: 'trip-edit',
			error: { message: err.message },
			offer,
		});
	}
});

router.get('/take-seat/:offerId', async (req, res) => {
	const userEmail = res.locals.email;
	const offerId = req.params.offerId;

	const offer = await getOne(offerId);
	const user = await getUserData(userEmail);

	const driver = offer._ownerId;

	const isBuddy = offer.buddies.includes(user.id);

	if (!isBuddy) {
		const trip = await Trip.findOne({ _id: offerId });

		if (!trip || trip.seats <= 0) {
			return res.redirect(`/roads/offer-details/${trip.id}`);
		}

		const updatedTrip = await Trip.findOneAndUpdate(
			{ _id: offerId, seats: { $gt: 0 } },
			{ $inc: { seats: -1 }, $push: { buddies: user.id } },
			{ new: true }
		);

		await User.findByIdAndUpdate(
			{ _id: user.id },
			{ $addToSet: { tripsSubscribedHistory: offerId } },
			{ new: true }
		);

		if (!updatedTrip) {
			return res.redirect(`/roads/offer-details/${trip.id}`);
		}

		const templateParams = {
			driverName: `${driver.firstName} ${driver.lastName}`,
			fromCity: offer.startPoint,
			toCity: offer.endPoint,
			date: offer.date,
			time: offer.time,
			passengerName: `${user.firstName} ${user.lastName}`,
			passengerPhone: user.phone,
			passengerEmail: user.email,
			link: `http://localhost:5000/roads/offer-details/${offer._id}`,
			appName: 'GoTogether',
			to_email: driver.email,
			name: `${user.firstName} ${user.lastName}`,
			profile: `http://localhost:5000/users/profile/${userEmail}`
		};

		try {
			const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					service_id: 'service_t53mrtj',
					template_id: 'template_zj35hqt',
					user_id: '3AiylRfCkSqHwsn_y',
					accessToken: 'vUv4pv5X-XBB2gnFLtNuw',
					template_params: templateParams
				})
			});

			if (!response.ok) {
				console.log(response);

				throw new Error('Неуспешно изпращане на имейл.');
			}

			console.log('Имейл, изпратен успешно!');
		} catch (error) {
			console.error('Грешка при изпращане на имейл:', error.message);
		}

		return res.redirect(`/roads/offer-details/${trip.id}`);
	}
});

router.get('/delete-offer/:offerId', async (req, res) => {
	const offer = await Trip.findById(req.params.offerId);
	offer.isDeleted = true;
	await editTrip(offer._id, offer);
	return res.redirect('/roads/road-offers');
});

router.get('/finish-offer/:offerId', async (req, res) => {
	const offer = await Trip.findById(req.params.offerId);
	const driver = await User.findById(offer._ownerId);

	offer.isFinished = true;
	await editTrip(offer._id, offer);

	driver.points += 10;
	await driver.save();
	return res.redirect('/roads/road-offers');
});

router.get('/challenges', async (req, res) => {
	const challenges = await Challenge.find().lean();
	const userChallenges = await UserChallenge.find().lean();

	console.log(userChallenges);

	const challengesWithProgress = challenges.map(ch => {
		const userCh = userChallenges.find(up => up.challengeId.toString() === ch._id.toString());

		const progress = userCh ? userCh.progress : 0;
		const completed = userCh ? userCh.completed : false;
		const rewarded = userCh ? userCh.rewarded : false;

		const percent = ch.target > 0 ? Math.min((progress / ch.target) * 100, 100) : 0;

		return {
			...ch,
			userProgress: progress,
			userCompleted: completed,
			userRewarded: rewarded,
			progressPercent: Number(percent.toFixed(0)),
			isEnroll: !!userCh
		};
	});

	console.log(challengesWithProgress);
	

	res.render('challenges', { layout: 'challenges', challengesWithProgress });
});

router.post('/challenges/create', async (req, res) => {
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

		const newChallenge = new Challenge({
			title,
			description,
			reward,
			points,
			status,
			goal,
			target,
			startDate,
			endDate
		});

		await newChallenge.save();

		res.redirect('/roads/challenges');
	} catch (err) {
		console.error('Грешка при създаване на предизвикателство:', err);
		res.redirect('/roads/challenges');
	}
});

router.get('/user-challenges/enroll/:challengeId', async (req, res) => {
	try {
		const userId = req.user;
		const challengeId = req.params.challengeId;

		const exists = await UserChallenge.findOne({ userId, challengeId });

		const userChallenge = new UserChallenge({
			userId,
			challengeId
		});

		await userChallenge.save();

		res.redirect('/roads/challenges');
	} catch (err) {
		console.error(err);
		res.status(500).send('Грешка при записване за предизвикателство.');
	}
});

export default router;