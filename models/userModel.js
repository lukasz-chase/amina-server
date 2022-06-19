import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  username: String,
  email: String,
  password: String,
  followedSubaminas: { type: [String], default: [] },
  birthday: { type: String, required: false },
  darkMode: Boolean,
  avatar: { type: String, required: false },
  savedPosts: { type: [String], default: [] },
  role: String,
});

export default mongoose.model("User", userSchema);
