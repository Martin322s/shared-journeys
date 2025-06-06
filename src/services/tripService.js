import Trip from "../models/Trip.js";
import User from "../models/User.js";

export const createTrip = async (data) => await Trip.create({ ...data, isDeleted: false, isFinished: false });
export const getAll = async () => (await Trip.find().lean()).filter(x => x.isDeleted == false);
export const getOne = async (tripId) => await Trip.findById({ _id: tripId }).populate('_ownerId');
export const deleteTrip = async (tripId) => await Trip.findByIdAndDelete({ _id: tripId });
export const editTrip = async (tripId, tripData) => await Trip.findByIdAndUpdate({ _id: tripId }, tripData);
export const getAuthor = async (authorId) => await User.findById(authorId);
export const addOffer = async (offer, authorId) => await User.findByIdAndUpdate({ _id: authorId }, { $push: { tripsSharedHistory: offer } });
export const myOffers = async (userId) => await Trip.find().where({ _ownerId: userId });
export const joinTrip = async (tripId, userId) => await Trip.findByIdAndUpdate({ _id: tripId }, { $push: { buddies: userId } });
export const editSeats = async (tripId, seats) => await Trip.findByIdAndUpdate({ _id: tripId }, { seats: seats });
export const getAllPassagers = async (tripId) => await Trip.findById({ _id: tripId }).populate({ path: 'buddies' });