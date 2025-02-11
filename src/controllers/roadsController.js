import express from 'express';

const router = express.Router();

router.get('/road-offers', (req, res) => {
    res.render('road-offers', { layout: 'roads' });
});

export default router;