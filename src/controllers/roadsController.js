import express from 'express';

const router = express.Router();

router.get('/road-offers', (req, res) => {
    res.render('road-offers', { layout: 'roads' });
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

export default router;