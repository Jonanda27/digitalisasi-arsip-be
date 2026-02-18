import mongoose from "mongoose";
import Folder from "../models/folder.js"; // pastikan path benar

const mongoURL = "mongodb://127.0.0.1:27017/e_arsip";

mongoose.connect(mongoURL)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.error("MongoDB connection error:", err));

async function seed() {
  try {
    const rootFolder = await Folder.create({ name: "Root Folder" });
    const subFolder = await Folder.create({ name: "Sub Folder", parent: rootFolder._id });

    console.log("Folders seeded:", rootFolder, subFolder);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

seed();
