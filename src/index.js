import express from 'express';
import router from './router.js';
import { initViewEngine } from '../config/view-engine.js';
import { initialDatabase } from '../config/database.js';
import cookieParser from 'cookie-parser';
import { auth } from './middlewares/authMiddleware.js';
import fileUpload from 'express-fileupload';
import session from 'express-session';

const app = express();
const port = 5000;

initViewEngine(app);
app.use(session({
	secret: 'sdgirgjjildsrfrgjildrgjildrghko;b04595t98ert4',
	resave: false,
	saveUninitialized: true,
	cookie: {
		maxAge: 1000 * 60 * 60,
		httpOnly: true
	}
}));

app.use(fileUpload());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());
app.use(auth);

initialDatabase()
	.then(() => {
		console.log("Database initialized successfully!");
		app.use(router);
		app.listen(port, () => console.log(`Server is working at: http://localhost:${port}`));
	})
	.catch((error) => {
		console.error("Database error: " + error.message);
		app.listen(port, () => console.log(`Server is working at: http://localhost:${port}, but database is not connected!`));
	});