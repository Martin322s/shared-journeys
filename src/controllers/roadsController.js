import express from 'express';

const router = express.Router();

router.get('/road-offers', (req, res) => {
    res.render('road-offers', { layout: 'roads' });
});

router.get('/about', (req, res) => {
    res.render('about', { layout: 'about' });
});

export default router;