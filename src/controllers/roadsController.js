import express from 'express';
import { addOffer, createTrip, getAll, getAllPassagers, getOne } from '../services/tripService.js';
import { getUserData } from '../services/authService.js';
import Trip from '../models/Trip.js';

const router = express.Router();

function isDatePassed(dateString) {
    const inputDate = new Date(dateString);
    const currentDate = new Date();
    return inputDate < currentDate;
}

router.get('/road-offers', async (req, res) => {
    const roadOffers = await getAll();
    res.render('road-offers', { layout: 'roads', roadOffers });
});

router.get('/about', (req, res) => {
    res.render('about', { layout: 'about' });
});

router.get('/contacts', (req, res) => {
    res.render('contacts', { layout: 'contacts' });
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
        availableSeats: offerDetails.seats > 0,
        buddies: passagers.buddies
    });
});

router.get('/edit-offer', (req, res) => {
    res.render('trip-edit', { layout: 'trip-edit' });
});

router.get('/take-seat/:offerId', async (req, res) => {
    const userEmail = res.locals.email;
    const offerId = req.params.offerId;

    const offer = await getOne(offerId);
    const user = await getUserData(userEmail);

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

        if (!updatedTrip) {
            return res.redirect(`/roads/offer-details/${trip.id}`);
        }

        return res.redirect(`/roads/offer-details/${trip.id}`);
    }
});



export default router;