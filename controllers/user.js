import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { uploadFile, deleteFiles } from "../s3.js";
import { unlinkFile } from "../middleware/multer.js";

import User from "../models/userModel.js";
import Subamin from "../models/subaminModel.js";
import mongoose from "mongoose";

export const signin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const oldUser = await User.findOne({ username });
    if (!oldUser)
      return res.status(404).json({ message: "User doesn`t exist" });
    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);
    if (!isPasswordCorrect)
      return res.status(404).json({ message: "Invalid password" });
    const token = jwt.sign(
      { username: oldUser.username, id: oldUser._id, role: oldUser.role },
      process.env.SECRET,
      {
        expiresIn: "24h",
      }
    );
    res.status(200).json({ result: oldUser, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const signup = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    const oldUser = await User.findOne({ email });
    if (oldUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await User.create({
      email,
      password: hashedPassword,
      username,
      role: "admin",
      darkMode: false,
    });

    const token = jwt.sign(
      { email: result.email, id: result._id, role: result.role },
      process.env.SECRET,
      {
        expiresIn: "24h",
      }
    );

    res.status(201).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  const { password, newPassword } = data;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No user with id: ${id}`);
  const oldUser = await User.findById(id);
  const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);
  if (!isPasswordCorrect) return res.status(404).json("Invalid password");
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await User.findByIdAndUpdate(
    id,
    { $set: { password: hashedPassword } },
    { new: true }
  );
  const updatedUser = await User.findById(id);

  res.json(updatedUser);
};
export const updateEmail = async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  const { email, password } = data;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No user with id: ${id}`);
  const oldUser = await User.findById(id);
  const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);
  if (!isPasswordCorrect)
    return res.status(404).json({ message: "Invalid password" });
  await User.findByIdAndUpdate(id, { $set: { email } }, { new: true });
  const updatedUser = await User.findById(id);

  res.json(updatedUser);
};
export const updateInfo = async (req, res) => {
  const { id } = req.params;
  const { birthday } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No user with id: ${id}`);
  const user = await User.findById(id);
  const result = await Promise.all(await uploadFile(req.files));
  const avatar = result.map(({ Location }) => Location);
  if (user.avatar && avatar) await deleteFiles([user.avatar]);
  Promise.all(req.files.map(({ path }) => unlinkFile(path)));
  await User.findByIdAndUpdate(
    id,
    { $set: { birthday, avatar: avatar[0] } },
    { new: true }
  );
  const updatedUser = await User.findById(id);

  res.json(updatedUser);
};

export const joinSubaminHandler = async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No user with id: ${id}`);

  const user = await User.findById(id);
  const subamin = await Subamin.findById(data);

  const index = user.followedSubaminas.findIndex(
    (id) => id === String(subamin._id)
  );

  if (index === -1) {
    user.followedSubaminas.push(subamin._id);
    await Subamin.findByIdAndUpdate(
      data,
      { $set: { members: subamin.members + 1 } },
      {
        new: true,
      }
    );
  } else {
    user.followedSubaminas = user.followedSubaminas.filter(
      (id) => id !== String(subamin._id)
    );
    await Subamin.findByIdAndUpdate(
      data,
      { $set: { members: subamin.members - 1 } },
      {
        new: true,
      }
    );
  }
  const userMod = await User.findByIdAndUpdate(id, user, { new: true });
  res.status(200).json({ user: userMod, subamin: subamin });
};
export const savePost = async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No user with id: ${id}`);

  const user = await User.findById(id);
  const index = user.savedPosts.findIndex((id) => id === String(data));

  if (index === -1) {
    user.savedPosts.push(data);
  } else {
    user.savedPosts = user.savedPosts.filter((id) => id !== String(data));
  }
  const userMod = await User.findByIdAndUpdate(id, user, { new: true });
  res.status(200).json(userMod);
};
export const changedarkMode = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No user with id: ${id}`);

  const user = await User.findById(id);
  const userMod = await User.findByIdAndUpdate(
    id,
    { $set: { darkMode: !user.darkMode } },
    { new: true }
  );

  res.json(userMod);
};

export const deleteAccount = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No user with id: ${id}`);
  await User.findByIdAndRemove(id);

  res.json({ message: "User deleted successfully." });
};
