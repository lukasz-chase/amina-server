import express from "express";
import {
  signin,
  signup,
  getUserById,
  updatePassword,
  deleteAccount,
  joinSubaminHandler,
  changedarkMode,
  savePost,
  updateInfo,
  updateEmail,
} from "../controllers/user.js";

import userAuth from "../middleware/userAuth.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post("/signin", signin);
router.post("/signup", signup);

router.get("/:id", getUserById);
router.patch("/darkMode/:id", userAuth, changedarkMode);
router.patch("/joinSubamin/:id", userAuth, joinSubaminHandler);
router.patch("/savePost/:id", userAuth, savePost);
router.post("/updateInfo/:id", userAuth, upload(), updateInfo);
router.patch("/updateEmail/:id", userAuth, updateEmail);
router.patch("/updatePassword/:id", userAuth, updatePassword);
router.delete("/deleteAccount/:id", userAuth, deleteAccount);

export default router;
