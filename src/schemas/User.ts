import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	id: { type: String, required: true, unique: true, sparse: true },
	username: { type: String, required: true },
	currency: {
		type: {
			gold: { type: Number, required: true },
			silver: { type: Number, required: true },
		},
		required: true,
	},
	country: { type: String, required: true },
	state: { type: String, required: true },
	clubs: [String],
});

export default mongoose.model("User", userSchema);
