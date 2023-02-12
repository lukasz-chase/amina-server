import express from "express";
import mongoose from "mongoose";

import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { uploadFiles } from "../cloudinary.js";
import { unlinkFile } from "../middleware/multer.js";

const router = express.Router();

export const getPost = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await Post.findById(id);
    res.status(200).json(item);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const getPosts = async (req, res) => {
  const { limit, orderBy } = req.query;
  try {
    const posts = await Post.find()
      .limit(limit)
      .sort({ [orderBy]: "desc" });
    res.status(200).json(posts);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const getSearchPost = async (req, res) => {
  const { searchQuery, limit, orderBy } = req.query;
  try {
    const query = new RegExp(searchQuery, "i");
    const posts = await Post.find({
      $or: [{ title: query }, { description: query }],
    })
      .sort({ [orderBy]: "desc" })
      .limit(limit);
    res.status(200).json(posts);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const getFeedPosts = async (req, res) => {
  const { id } = req.params;
  const { limit, orderBy } = req.query;
  try {
    const user = await User.findById(id);
    const posts = await Post.find({
      subaminId: { $in: user.followedSubaminas },
    })
      .limit(limit)
      .sort({ [orderBy]: "desc" });
    res.status(200).json(posts);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getUserSavedPosts = async (req, res) => {
  const { limit } = req.query;
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    const posts = await Post.find({
      _id: { $in: user.savedPosts },
    }).limit(limit);
    res.status(200).json(posts);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const getUserPosts = async (req, res) => {
  const { limit, orderBy } = req.query;
  const { id } = req.params;
  try {
    const posts = await Post.find({
      authorId: id,
    })
      .limit(limit)
      .sort({ [orderBy]: "desc" });
    res.status(200).json(posts);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getSubaminPosts = async (req, res) => {
  const { limit, orderBy } = req.query;
  const { id } = req.params;
  try {
    const posts = await Post.find({
      subaminId: id,
    })
      .limit(limit)
      .sort({ [orderBy]: "desc" });
    res.status(200).json(posts);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createPost = async (req, res) => {
  const post = req.body;
  const result = await Promise.all(await uploadFiles(req.files));
  const images = result.map(({ url }) => url);
  Promise.all(req.files.map(({ path }) => unlinkFile(path)));
  const newPost = new Post({
    ...post,
    images: images,
    subaminId: JSON.parse(post.subaminId),
    authorId: JSON.parse(post.authorId),
  });
  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No post with id: ${id}`);
  await Post.findByIdAndRemove(id);

  res.json({ message: "Post deleted successfully." });
};

export const likePost = async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  const { action } = req.query;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No post with id: ${id}`);
  const post = await Post.findById(id);
  const upvoted = post.upvotedBy.findIndex((id) => id === String(data));
  const downvoted = post.downvotedBy.findIndex((id) => id === String(data));
  if (action === "upvote") {
    post.downvotedBy = post.downvotedBy.filter((id) => id !== String(data));
    if (downvoted === 0) {
      post.upvotes = post.upvotes + 1;
    }
    if (upvoted === -1) {
      post.upvotedBy.push(data);
      post.upvotes = post.upvotes + 1;
    } else {
      post.upvotedBy = post.upvotedBy.filter((id) => id !== String(data));
      post.upvotes = post.upvotes - 1;
    }
  } else {
    post.upvotedBy = post.upvotedBy.filter((id) => id !== String(data));
    if (upvoted === 0) {
      post.upvotes = post.upvotes - 1;
    }
    if (downvoted === -1) {
      post.downvotedBy.push(data);
      post.upvotes = post.upvotes - 1;
    } else {
      post.downvotedBy = post.downvotedBy.filter((id) => id !== String(data));
      post.upvotes = post.upvotes + 1;
    }
  }

  const updatedPost = await Post.findByIdAndUpdate(id, post, {
    new: true,
  });

  res.status(200).json(updatedPost);
};

export default router;
