import express from "express";
import mongoose from "mongoose";

import Comment from "../models/commentModel.js";

const router = express.Router();

export const getComments = async (req, res) => {
  const { id } = req.params;
  const { orderBy } = req.query;
  try {
    const comments = await Comment.find({ postId: id }).sort({
      [orderBy]: "desc",
    });
    res.status(200).json(comments);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createComment = async (req, res) => {
  const comment = req.body;
  const newComment = new Comment({
    ...comment,
  });
  try {
    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
export const editComment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No comment with id: ${id}`);
  const updatedComment = await Comment.findByIdAndUpdate(
    id,
    { $set: { text } },
    { new: true }
  );
  res.json(updatedComment);
};

export const deleteComment = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No comment with id: ${id}`);
  await Comment.findByIdAndRemove(id);

  res.json({ message: "Comment deleted successfully." });
};

export const likeComment = async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  const { action } = req.query;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No comment with id: ${id}`);

  const comment = await Comment.findById(id);
  const upvoted = comment.upvotedBy.findIndex((id) => id === String(data));
  const downvoted = comment.downvotedBy.findIndex((id) => id === String(data));
  if (action === "upvote") {
    comment.downvotedBy = comment.downvotedBy.filter(
      (id) => id !== String(data)
    );
    if (downvoted === 0) {
      comment.upvotes = comment.upvotes + 1;
    }
    if (upvoted === -1) {
      comment.upvotedBy.push(data);
      comment.upvotes = comment.upvotes + 1;
    } else {
      comment.upvotedBy = comment.upvotedBy.filter((id) => id !== String(data));
      comment.upvotes = comment.upvotes - 1;
    }
  } else {
    comment.upvotedBy = comment.upvotedBy.filter((id) => id !== String(data));
    if (upvoted === 0) {
      comment.upvotes = comment.upvotes - 1;
    }
    if (downvoted === -1) {
      comment.downvotedBy.push(data);
      comment.upvotes = comment.upvotes - 1;
    } else {
      comment.upvotes = comment.upvotes + 1;
      comment.downvotedBy = comment.downvotedBy.filter(
        (id) => id !== String(data)
      );
    }
  }

  const updatedComment = await Comment.findByIdAndUpdate(id, comment, {
    new: true,
  });

  res.status(200).json(updatedComment);
};

export default router;
