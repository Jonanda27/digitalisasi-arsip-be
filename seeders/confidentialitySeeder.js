import mongoose from "mongoose";
import DocumentConfidentiality from "../models/documentConfidentiality.js";

const MONGO_URI = "mongodb://localhost:27017/e_arsip"; // sesuaikan

const levels = [
  { code: "1", name: "Umum" },
  { code: "2", name: "Terbatas" },
  { code: "3", name: "Rahasia" },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);

    await DocumentConfidentiality.deleteMany({});
    await DocumentConfidentiality.insertMany(levels);

    console.log("✅ Confidentiality levels seeded!");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
