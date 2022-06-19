import mongoose from "mongoose";
const { Schema } = mongoose;

const commentSchema = new Schema({
  author: String,
  authorId: String,
  upvotes: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  text: String,
  upvotedBy: { type: [String], default: [] },
  downvotedBy: { type: [String], default: [] },
  postId: String,
});

export default mongoose.model("Comment", commentSchema);
