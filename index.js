import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import userRoutes from "./routes/user.js";
import postRoutes from "./routes/posts.js";
import subaminRoutes from "./routes/subamins.js";
import commentsRoutes from "./routes/comments.js";

const app = express();
dotenv.config();

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.use("/user", userRoutes);
app.use("/posts", postRoutes);
app.use("/subamins", subaminRoutes);
app.use("/comments", commentsRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.CONNECTION_URL)
  .then(() =>
    app.listen(PORT, () =>
      console.log(`Server is running on port: http://localhost:${PORT}`)
    )
  )
  .catch((err) => console.log(`${err} did not connect`));
