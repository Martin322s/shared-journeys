import express from 'express';
import router from './router.js';
import { initViewEngine } from '../config/view-engine.js';
import { initialDatabase } from '../config/database.js';
import cookieParser from 'cookie-parser';
import { auth } from './middlewares/authMiddleware.js';
import fileUpload from 'express-fileupload';

const app = express();
const port = 5000

initViewEngine(app);
app.use(fileUpload());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());
app.use(auth);
app.use(router);

initialDatabase()
    .then(() => {
        console.log("Database initialized successfully!");
        app.listen(port, () => console.log(`Server is working at: http://localhost:${port}`));
    })
    .catch((error) => {
        console.log("Database error: " + error.message);
    });