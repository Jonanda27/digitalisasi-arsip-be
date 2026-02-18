import mongoose from "mongoose";
import dotenv from "dotenv";
import File from "../models/file.js";
import Folder from "../models/folder.js";

dotenv.config();

async function seedFiles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    // (opsional) hapus data lama
    await File.deleteMany();

    // ambil satu folder sebagai contoh (kalau ada)
    const folder = await Folder.findOne();

    const files = [
      {
        name: "1700000000000-laporan.pdf",
        originalName: "laporan.pdf",
        folder: folder ? folder._id : null,
        path: "uploads/1700000000000-laporan.pdf",
        mimetype: "application/pdf",
        size: 245760,
      },
      {
        name: "1700000001000-data.xlsx",
        originalName: "data.xlsx",
        folder: folder ? folder._id : null,
        path: "uploads/1700000001000-data.xlsx",
        mimetype:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 102400,
      },
      {
        name: "1700000002000-foto.png",
        originalName: "foto.png",
        folder: null, // file di root
        path: "uploads/1700000002000-foto.png",
        mimetype: "image/png",
        size: 512000,
      },
    ];

    await File.insertMany(files);

    console.log("Seeder file berhasil dijalankan");
    process.exit(0);
  } catch (err) {
    console.error("Seeder file gagal:", err);
    process.exit(1);
  }
}

seedFiles();
