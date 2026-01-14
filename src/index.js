import express from 'express';
import router from './router.js';
import { initViewEngine } from '../config/view-engine.js';
import { initialDatabase } from '../config/database.js';
import cookieParser from 'cookie-parser';
import { auth } from './middlewares/authMiddleware.js';
import fileUpload from 'express-fileupload';
import session from 'express-session';

const app = express();

const port = process.env.PORT || 8080;

app.set('trust proxy', 1);

initViewEngine(app);

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

app.use(fileUpload());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(auth);

initialDatabase()
  .then(() => {
    console.log('Database initialized successfully!');
    app.use(router);
    app.listen(port, () => {
      console.log(`Server is working on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Database error:', error.message);
    app.use(router);
    app.listen(port, () => {
      console.log(`Server is working on port ${port}, but database is not connected`);
    });
  });
