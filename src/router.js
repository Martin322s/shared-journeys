import express from 'express';
import homeController from './controllers/homeController.js';
import roadsController from './controllers/roadsController.js';
import authController from './controllers/authController.js';


const router = express.Router();

router.use('/', homeController);
router.use('/roads', roadsController);
router.use('/users', authController);
router.get('*', (req, res) => res.render('<h1>404 NOT FOUND</h1>'));

export default router;