import express from "express";
import {
  createSubamin,
  getSubamin,
  deleteSubamin,
  getSubaminsBySearch,
  getUserSubamins,
  getUserSubaminsBySearch,
  getTopSubamin,
  editSubamin,
  getUserCreatedSubamins,
} from "../controllers/subamin.js";
import userAuth from "../middleware/userAuth.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.get("/user/search/:id", getUserSubaminsBySearch);
router.get("/search", getSubaminsBySearch);
router.get("/user/:id", getUserSubamins);
router.get("/userCreated/:id", getUserCreatedSubamins);
router.get("/top", getTopSubamin);
router.get("/:id", getSubamin);

router.post("/", userAuth, upload(), createSubamin);
router.patch("/:id", userAuth, upload(), editSubamin);
router.delete("/delete/:id", userAuth, deleteSubamin);

export default router;
