import express from 'express';
import { generateToken, getUserData, loginUser, registerUser, sendVerificationEmail } from '../services/authService.js';
import { privateGuardGuest, privateGuardUser } from '../middlewares/authMiddleware.js';
import { myOffers } from '../services/tripService.js';
import User from '../models/User.js';
import getRankTitle from '../utils/points.js';

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
	if (req.query.error == 'jwt expired') {
		return res.render('login', { layout: 'login', error: { message: 'Вашата сесия е изтекла. Моля, влезте отново!' } });
	}

	res.render('login', { layout: 'login' });
});

router.post('/login', async (req, res) => {
	const { email, password } = req.body;

	try {
		if ((email && password) && (email !== '' && password !== '')) {
			const emailRegex = new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');

			const userProfile = await User.findOne({ email });

			if (userProfile && userProfile.isDeleted == true) {
				throw {
					message: 'Вашият акаунт е със спряна активност. Моля, свържете се с администраторите!'
				}
			}

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
				message: 'Невалиден формат на снимката!'
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

router.get('/profile/:userEmail', privateGuardGuest, async (req, res) => {
	const email = req.params.userEmail;
	const userData = await getUserData(email);
	const createdRoads = await myOffers(userData._id);

	const driver = await User.findById(userData._id)
		.populate({
			path: 'tripsSubscribedHistory',
			populate: { path: '_ownerId', select: 'firstName lastName email phone' }
		})
		.exec();

	res.render('profile', {
		layout: 'profile',
		user: {
			_id: userData._id,
			firstName: userData.firstName,
			lastName: userData.lastName,
			email: userData.email,
			profilePicture: userData.profilePicture,
			phone: userData.phone,
			tripsSubscribedHistory: userData.tripsSubscribedHistory,
			tripsSharedHistory: userData.tripsSharedHistory,
			createdAt: userData.formattedDate,
			followers: userData.followers,
			following: userData.following,
			points: userData.points,
			accountTitle: getRankTitle(userData.points)
		},
		driver: driver,
		createdRoads,
		notCurrentUser: !(req.params.userEmail == req.email),
		follow: req.user !== userData._id.toString() && !userData.followers.includes(req.user),
		message: req.user !== userData._id.toString() && userData.followers.includes(req.user),
		followedUser: userData.email,
		followingUser: req.email
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

router.get('/follow-user/:followedUser/:followingUser', async (req, res) => {
	const followedUser = req.params.followedUser;
	const followingUser = req.params.followingUser;

	const followedUserData = await getUserData(followedUser);
	const followingUserData = await getUserData(followingUser);

	await User.findByIdAndUpdate(
		{ _id: followedUserData.id },
		{ $addToSet: { followers: followingUserData._id } },
		{ new: true }
	);

	await User.findByIdAndUpdate(
		{ _id: followingUserData._id },
		{ $addToSet: { following: followedUserData._id } },
		{ new: true }
	);

	followingUserData.points += 2;
	await followingUserData.save();

	res.redirect(`/users/profile/${followedUserData.email}`);
});

router.get('/profiles', async (req, res) => {
	const users = await User.find().lean();
	res.render('drivers', { layout: 'drivers', users: users.filter(x => x._id.toString() !== req.user) });
});

router.get('/delete/:userId', async (req, res) => {
	const user = await User.findById(req.params.userId);
	user.isDeleted = true;
	await User.findByIdAndUpdate({ _id: user._id }, user);
	return res.redirect('/admin');
});

router.get('/restore/:userId', async (req, res) => {
	const user = await User.findById(req.params.userId);
	user.isDeleted = false;
	await await User.findByIdAndUpdate({ _id: user._id }, user);
	return res.redirect('/admin');
});

router.get('/promote/:userId', async (req, res) => {
	const user = await User.findById(req.params.userId);
	user.role = 'admin';
	await User.findByIdAndUpdate({ _id: user._id }, user);
	return res.redirect('/admin');
});

router.get('/demote/:userId', async (req, res) => {
	const user = await User.findById(req.params.userId);
	user.role = 'user';
	await User.findByIdAndUpdate({ _id: user._id }, user);
	return res.redirect('/admin');
});

router.get('/forgot-password', (req, res) => {
	console.log(req.session);

	res.render('forgot-password', { layout: 'forgot-password', showCodeField: req.session.resetCode ? true : false });
});

router.post('/forgot-password-change', async (req, res) => {
	const userEmail = req.body.email;
	const user = await User.find({ email: userEmail });

	const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
	req.session.resetCode = resetCode;
	req.session.resetEmail = user.email;

	const SERVICE_ID = 'service_t53mrtj';
	const TEMPLATE_ID = 'template_ro88aie';
	const PUBLIC_KEY = '3AiylRfCkSqHwsn_y';
	const ACCESS_TOKEN = 'vUv4pv5X-XBB2gnFLtNuw';

	const templateParams = {
		to_email: userEmail,
		passcode: req.session.resetCode
	}

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

	res.render('forgot-password-code', { layout: 'forgot-password', error: { message: 'Кодът е изпратен успешно!' } });
});

router.post('/forgot-password-code', async (req, res) => {
	if (req.body.code == req.session.resetCode) {
		res.render('forgot-password-pass', { layout: 'forgot-password', error: { message: 'Кодът е правилен, моля променете паролата си!' } });
	} else {
		res.render('forgot-password-code', { layout: 'forgot-password', error: { message: 'Въведеният код не съвпада!' } });
	}
});

router.post('/forgot-password-pass', async (req, res) => {
	console.log(req.body);
});

export default router;