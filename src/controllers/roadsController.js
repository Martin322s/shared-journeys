import express from 'express';
import { addOffer, createTrip, getAll } from '../services/tripService.js';

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

router.get('/offer-details', (req, res) => {
    res.render('details', { layout: 'details' });
});

router.get('/edit-offer', (req, res) => {
    res.render('trip-edit', { layout: 'trip-edit' });
});



export default router;