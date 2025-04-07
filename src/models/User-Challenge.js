import mongoose from 'mongoose';

const userChallengeSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
	progress: { type: Number, default: 0 },
	completed: { type: Boolean, default: false },
	rewarded: { type: Boolean, default: false },
	startedAt: { type: Date, default: Date.now }
});

const UserChallenge = mongoose.model('UserChallenge', userChallengeSchema);

export default UserChallenge;