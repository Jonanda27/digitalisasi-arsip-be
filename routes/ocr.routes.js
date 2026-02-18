import express from "express";
import multer from "multer";
import { runOCR } from "../services/ocr.service.js";
import { OCRLog } from "../models/ocrLog.js";


const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post("/scan-ocr", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File wajib" });

    const text = await runOCR(req.file.path, req.file.mimetype);

    // CATAT KE DATABASE: Tambahkan baris ini
    await OCRLog.create({ status: "success" });

    res.json({ success: true, text });
  } catch (err) {
    console.error("OCR API error:", err);
    res.status(500).json({ success: false, message: "OCR gagal" });
  }
});

router.get("/global-stats", async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Hitung semua dokumen dari semua user sejak awal bulan
    const totalScans = await OCRLog.countDocuments({
      scannedAt: { $gte: startOfMonth }
    });

    res.json({
      success: true,
      period: startOfMonth.toLocaleString('id-ID', { month: 'long', year: 'numeric' }),
      totalScans: totalScans
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal memuat statistik" });
  }
});

export default router;
