import mongoose from 'mongoose';
import { CONNECTION_STRING } from './constants.js';
export const initialDatabase = () => mongoose.connect(CONNECTION_STRING);