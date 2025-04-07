import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
	title: String,
	description: String,
	reward: {
		type: String,
	},
	points: Number,
	status: String,
	goal: {
		type: String,
	},
	target: Number,
	condition: String,
	imageUrl: String,
	startDate: Date,
	endDate: Date,
},
	{ timestamps: true }
);

const Challenge = mongoose.model('Challenge', challengeSchema);

export default Challenge;