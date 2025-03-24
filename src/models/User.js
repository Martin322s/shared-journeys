import mongoose from "mongoose";
import { format } from 'date-fns';

const userSchema = new mongoose.Schema({
    isVerified: {
        type: Boolean,
        required: true
    },
    isDeleted: {
        type: Boolean,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'admin']
    },
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
        required: true,
        unique: true
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
    }],
    followers: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }],
    isDeleted: {
        type: Boolean,
        required: true
    },
}, { timestamps: true });

userSchema.virtual('formattedDate').get(function () {
    return format(this.createdAt, 'dd.MM.yyyy HH:mm');
});

const User = mongoose.model('User', userSchema);

export default User;