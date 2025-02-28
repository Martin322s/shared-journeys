import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female']
    },
    tripsHistory: [{
        type: mongoose.Types.ObjectId,
        ref: 'Trip'
    }]
});

const User = mongoose.model('User', userSchema);

export default User;