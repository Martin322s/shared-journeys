import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { layout: 'main' });
});

router.get('/admin', (req, res) => {
    res.render('admin', { layout: 'admin' });
});

export default router;