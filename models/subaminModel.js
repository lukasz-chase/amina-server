import mongoose from "mongoose";
const { Schema } = mongoose;

const subaminSchema = new Schema({
  name: String,
  members: Number,
  logo: String,
  desc: String,
  backgroundImg: String,
  authorId: String,
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

export default mongoose.model("Subamin", subaminSchema);
