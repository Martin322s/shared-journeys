import express from 'express';
import homeController from './controllers/homeController.js';

const router = express.Router();

router.use('/', homeController);
router.get('*', (req, res) => res.render('<h1>404 NOT FOUND</h1>'));

export default router;