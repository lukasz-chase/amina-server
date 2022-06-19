import express from "express";
import {
  getComments,
  createComment,
  deleteComment,
  likeComment,
  editComment,
} from "../controllers/comment.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

router.post("/create", userAuth, createComment);

router.get("/:id", getComments);
router.patch("/edit/:id", userAuth, editComment);
router.delete("/delete/:id", userAuth, deleteComment);
router.patch("/like/:id", userAuth, likeComment);

export default router;
