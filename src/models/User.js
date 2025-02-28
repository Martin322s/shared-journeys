import mongoose from "mongoose";
import { format } from 'date-fns';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    tripsSharedHistory: [{
        type: mongoose.Types.ObjectId,
        ref: 'Trip'
    }],
    tripsSubscribedHistory: [{
        type: mongoose.Types.ObjectId,
        ref: 'Trip'
    }]
}, { timestamps: true });

userSchema.virtual('formattedDate').get(function () {
    return format(this.createdAt, 'dd.MM.yyyy HH:mm');
});

const User = mongoose.model('User', userSchema);

export default User;