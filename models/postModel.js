import mongoose from "mongoose";
const { Schema } = mongoose;

const postSchema = new Schema({
  subaminId: String,
  subaminName: String,
  subaminLogo: String,
  title: String,
  description: String,
  author: String,
  authorId: String,
  upvotes: { type: Number, default: 0 },
  upvotedBy: { type: [String], default: [] },
  downvotedBy: { type: [String], default: [] },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  images: [String],
});

export default mongoose.model("Post", postSchema);
