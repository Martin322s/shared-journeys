import mongoose from "mongoose";

const tripSchema = new mongoose.Schema({
    startPoint: {
        type: String,
        required: true
    },
    endPoint: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    carImage: {
        type: String,
        required: true
    },
    carBrand: {
        type: String,
        required: true
    },
    seats: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    _ownerId: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    buddies: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }],
    isDeleted: {
        type: Boolean,
        required: true
    },
    isFinished: {
        type: Boolean,
        required: true
    },
}, { timestamps: true });

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;