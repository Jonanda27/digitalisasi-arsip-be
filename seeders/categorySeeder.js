import mongoose from "mongoose";
import DocumentCategory from "../models/documentCategory.js";

const MONGO_URI = "mongodb://localhost:27017/e_arsip"; // sesuaikan

const categories = [
  { code: "01", name: "SOP" },
  { code: "02", name: "Surat" },
  { code: "03", name: "Laporan" },
  { code: "04", name: "Keuangan" },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);

    await DocumentCategory.deleteMany({});
    await DocumentCategory.insertMany(categories);

    console.log("✅ Numeric category codes seeded!");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
