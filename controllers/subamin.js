import express from "express";
import mongoose from "mongoose";

import Subamin from "../models/subaminModel.js";
import User from "../models/userModel.js";
import { uploadFiles } from "../cloudinary.js";
import { unlinkFile } from "../middleware/multer.js";

const router = express.Router();

export const getSubamin = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await Subamin.findById(id);
    res.status(200).json(item);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getTopSubamin = async (req, res) => {
  try {
    const LIMIT = 5;
    const subamin = await Subamin.find().sort({ members: -1 }).limit(LIMIT);
    res.json(subamin);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getUserSubamins = async (req, res) => {
  const { limit } = req.query;
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    const subamins = await Subamin.find({
      _id: { $in: user.followedSubaminas },
    }).limit(limit);
    res.status(200).json({ subamins });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const getUserCreatedSubamins = async (req, res) => {
  const { id } = req.params;
  try {
    const subamins = await Subamin.find({
      authorId: id,
    }).sort({ createdAt: -1 });
    res.status(200).json(subamins);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const getUserSubaminsBySearch = async (req, res) => {
  const { searchQuery } = req.query;
  const { id } = req.params;
  try {
    const query = new RegExp(searchQuery, "i");
    const limit = 20;
    const user = await User.findById(id);
    const subamins = await Subamin.find({
      _id: { $in: user.followedSubaminas },
      $or: [{ name: query }, { desc: query }],
    }).limit(limit);
    res.status(200).json(subamins);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getSubaminsBySearch = async (req, res) => {
  const { searchQuery, limit, orderBy } = req.query;
  try {
    const query = new RegExp(searchQuery, "i");
    const subamins = await Subamin.find({
      $or: [{ name: query }, { desc: query }],
    })
      .sort({ [orderBy]: -1 })
      .limit(limit);
    res.status(200).json(subamins);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createSubamin = async (req, res) => {
  const subamin = req.body;
  const result = await Promise.all(await uploadFile(req.files));
  const images = result.reduce((obj, { Location }) => {
    return {
      ...obj,
      [Location.split("-")[Location.split("-").length - 1]]: Location,
    };
  }, []);
  Promise.all(req.files.map(({ path }) => unlinkFile(path)));
  const newSubamin = new Subamin({
    ...subamin,
    ...(images["backgroundImg"]
      ? { backgroundImg: images["backgroundImg"] }
      : ""),
    logo: images["logo"],
    members: 0,
    authorId: JSON.parse(subamin.authorId),
  });
  try {
    await newSubamin.save();
    res.status(201).json(newSubamin);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
export const editSubamin = async (req, res) => {
  const subaminData = req.body;
  const { id } = req.params;
  const oldSubamin = await Subamin.findById(id);
  const result = await Promise.all(await uploadFile(req.files));
  const images = result.reduce((obj, { Location }) => {
    return {
      ...obj,
      [Location.split("-")[Location.split("-").length - 1]]: Location,
    };
  }, []);
  Promise.all(req.files.map(({ path }) => unlinkFile(path)));

  try {
    const subaminMod = await Subamin.findByIdAndUpdate(
      id,
      {
        $set: {
          backgroundImg:
            subaminData.backgroundImg === ""
              ? oldSubamin.backgroundImg
              : images["backgroundImg"],
          logo: subaminData.logo === "" ? oldSubamin.logo : images["logo"],
          desc: subaminData.desc,
          name: subaminData.name,
        },
      },
      { new: true }
    );
    res.status(201).json(subaminMod);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const deleteSubamin = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No item with id: ${id}`);
  const subamins = await Subamin.findById(id);
  await Subamin.findByIdAndRemove(id);

  res.json({ message: "Subamin deleted successfully." });
};

export default router;
