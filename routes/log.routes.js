import express from "express";
import Log from "../models/log.js"; // Tambahkan ekstensi .js jika menggunakan ESM
import { authRequired } from "../middleware/auth.js"; // Tambahkan ekstensi .js

const router = express.Router();

// routes/log.routes.js
router.post("/", authRequired, async (req, res) => {
  try {
    const { kategori, aktivitas, status } = req.body;

    // Pastikan menggunakan ._id agar sesuai dengan middleware di atas
    const newLog = new Log({
      userId: req.user._id, 
      kategori,
      aktivitas,
      status: status || "sukses",
    });

    await newLog.save();
    res.status(201).json({ message: "Log dicatat", data: newLog });
  } catch (error) {
    res.status(500).json({ message: "Gagal mencatat log", error: error.message });
  }
});

router.get("/", authRequired, async (req, res) => {
  try {
    // Gunakan ._id juga untuk pencarian log
    const logs = await Log.find({ userId: req.user._id }).sort({ waktu: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil log", error: error.message });
  }
});

// ENDPOINT: Ambil Log Milik User (GET /api/logs)
router.get("/", authRequired, async (req, res) => {
  try {
    const logs = await Log.find({ userId: req.user.id }).sort({ waktu: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil log", error: error.message });
  }
});

router.get("/all", authRequired, async (req, res) => {
  try {
    // Kosongkan parameter .find() agar mengambil semua data
    const logs = await Log.find()
      .populate("userId", "username nama") // Opsional: supaya muncul nama orangnya, bukan ID saja
      .sort({ waktu: -1 });
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ 
      message: "Gagal mengambil semua data log", 
      error: error.message 
    });
  }
});

export default router; // Menggunakan export default agar bisa diimport di app.js