import mongoose from "mongoose";
import dotenv from "dotenv";
import Folder from "../models/folder.js";
import File from "../models/file.js";

dotenv.config();

async function seedFolderWithFiles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // bersihkan data lama
    await File.deleteMany();
    await Folder.deleteMany();

    /* ========= FOLDER ========= */

    // Root folders
    const dokumen = await Folder.create({ name: "Dokumen", parent: null });
    const laporan = await Folder.create({ name: "Laporan", parent: null });

    // Sub folders
    const laporan2024 = await Folder.create({
      name: "Laporan 2024",
      parent: laporan._id,
    });

    const laporan2025 = await Folder.create({
      name: "Laporan 2025",
      parent: laporan._id,
    });

    /* ========= FILE ========= */

    const files = [
      // File di root
      {
        name: "1700000000000-panduan.pdf",
        originalName: "panduan.pdf",
        folder: null,
        path: "uploads/1700000000000-panduan.pdf",
        mimetype: "application/pdf",
        size: 120000,
      },

      // File di folder Dokumen
      {
        name: "1700000001000-surat.docx",
        originalName: "surat.docx",
        folder: dokumen._id,
        path: "uploads/1700000001000-surat.docx",
        mimetype:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: 34000,
      },

      // File di Laporan 2024
      {
        name: "1700000002000-laporan-jan.pdf",
        originalName: "laporan-januari.pdf",
        folder: laporan2024._id,
        path: "uploads/1700000002000-laporan-jan.pdf",
        mimetype: "application/pdf",
        size: 220000,
      },
      {
        name: "1700000003000-laporan-feb.pdf",
        originalName: "laporan-februari.pdf",
        folder: laporan2024._id,
        path: "uploads/1700000003000-laporan-feb.pdf",
        mimetype: "application/pdf",
        size: 210000,
      },

      // File di Laporan 2025
      {
        name: "1700000004000-laporan-jan-2025.pdf",
        originalName: "laporan-januari-2025.pdf",
        folder: laporan2025._id,
        path: "uploads/1700000004000-laporan-jan-2025.pdf",
        mimetype: "application/pdf",
        size: 250000,
      },
    ];

    await File.insertMany(files);

    console.log("Seeder folder & file berhasil 🎉");
    process.exit(0);
  } catch (err) {
    console.error("Seeder gagal:", err);
    process.exit(1);
  }
}

seedFolderWithFiles();
