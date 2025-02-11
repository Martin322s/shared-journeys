import express from 'express';
import router from './router.js';
import { initViewEngine } from '../config/view-engine.js';

const app = express();
const port = 5000;

initViewEngine(app);
app.use(express.static('public'));
app.use(express.json());
app.use(router);

app.listen(port, () => console.log(`Server is listening on: ${port}...`));