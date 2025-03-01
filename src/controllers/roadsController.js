import express from 'express';
import { createTrip, getAll } from '../services/tripService.js';

const router = express.Router();

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
        const carImage = req.files.carImage;
        const base64Image = carImage.data.toString('base64');
        const imageWithPrefix = `data:${carImage.mimetype};base64,${base64Image}`;
        const _ownerId = req.user;

        const roadData = { ...req.body, carImage: imageWithPrefix, _ownerId, buddies: [] };
        await createTrip(roadData);
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