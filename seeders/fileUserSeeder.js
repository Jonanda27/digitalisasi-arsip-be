import mongoose from "mongoose";
import dotenv from "dotenv";
import FileUser from "../models/fileUser.js";

dotenv.config();

const seedFileUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");

    // optional reset
    await FileUser.deleteMany();
    console.log("🗑 fileUser cleared");

    const dummy = [
      {
        name: "170000010-user.pdf",
        originalName: "surat-user.pdf",
        path: "uploads/170000010-user.pdf",
        mimetype: "application/pdf",
        size: 111222,

        folder: null,

        namaFile: "SURAT-USER",
        bidang: "010",
        noUrut: "001",
        unitKerja: "BAPENDA",
        tahun: "2026",
        noDokumenPreview: "010/001/BAPENDA/2026",

        kantorBidang: "Pelayanan",
        noRak: "A-10",
        lokasi: "Lantai 1",

        kategori: "Surat",

        namaInstansi: "Wajib Pajak",
        nomorSurat: "USR/01/I/2026",
        perihal: "Permohonan",

        kerahasiaan: "Umum",
        tipeDokumen: "Digital",

        noArsip: "ARS-USER-001",
        noArsipPreview: "20260110-091200",
      },
    ];

    await FileUser.insertMany(dummy);

    console.log("🌱 Seeder fileUser berhasil");

    process.exit();
  } catch (err) {
    console.error("❌ Seeder error:", err);
    process.exit(1);
  }
};

seedFileUser();
