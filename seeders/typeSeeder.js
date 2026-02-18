import mongoose from "mongoose";
import DocumentType from "../models/documentType.js";

const MONGO_URI = "mongodb://localhost:27017/e_arsip"; // sesuaikan

const types = [
  { code: "1", name: "Analog" },
  { code: "2", name: "Digital" },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);

    await DocumentType.deleteMany({});
    await DocumentType.insertMany(types);

    console.log("✅ Document types seeded!");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
