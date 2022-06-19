import express from "express";
import {
  createPost,
  getPost,
  likePost,
  deletePost,
  getPosts,
  getFeedPosts,
  getUserSavedPosts,
  getSearchPost,
  getUserPosts,
  getSubaminPosts,
} from "../controllers/post.js";
import userAuth from "../middleware/userAuth.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.get("/", getPosts);
router.get("/search", getSearchPost);
router.get("/feed/:id", getFeedPosts);
router.get("/savedPosts/:id", getUserSavedPosts);
router.get("/user/:id", getUserPosts);
router.get("/:id", getPost);
router.get("/subamin/:id", getSubaminPosts);

router.post("/", userAuth, upload(), createPost);
router.delete("/delete/:id", userAuth, deletePost);
router.patch("/like/:id", userAuth, likePost);

export default router;
