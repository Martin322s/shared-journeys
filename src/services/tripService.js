import Trip from "../models/Trip";
import User from "../models/User";

export const createTrip = async (data) => await Trip.create(data);
export const getAll = async () => await Trip.find().lean();
export const getOne = async (tripId) => await Trip.findById({ _id: tripId }).populate('owner');
export const deleteTrip = async (tripId) => await Trip.findByIdAndDelete({ _id: tripId });
export const editTrip = async (tripId, tripData) => await Trip.findByIdAndUpdate({ _id: tripId }, tripData);
export const getAuthor = async (authorId) => await User.findById(authorId);
export const addOffer = async (offer, authorId) => await User.findByIdAndUpdate({ _id: authorId }, { $push: { tripsHistory: offer } });
export const myOffers = async (userId) => await Trip.find().where({ owner: userId });
export const joinTrip = async (tripId, userId) => await Trip.findByIdAndUpdate({ _id: tripId }, { $push: { buddies: userId } });
export const editSeats = async (tripId, seats) => await Trip.findByIdAndUpdate({ _id: tripId }, { seats: seats });
export const getAllPassagers = async (tripId) => await Trip.findById({ _id : tripId }).populate({ path: 'buddies' });