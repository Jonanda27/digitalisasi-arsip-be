import express from "express";
import multer from "multer";
import FileUser from "../models/fileUser.js";

const router = express.Router();

/* ===== MULTER CONFIG ===== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // pastikan folder uploads/ ada
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${unique}-${file.originalname}`);
  },
});

const upload = multer({ storage });

/* ===== CREATE FILE USER ===== */
router.post("/create", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File diperlukan" });

    console.log("req.body:", req.body); // debug metadata
    console.log("req.file:", req.file); // debug file info

    // ambil semua metadata dari req.body
    const data = {
      name: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      ...req.body, // semua field form dikirim dari frontend
    };

    const fileUser = await FileUser.create(data);

    res.status(201).json({
      message: "File berhasil dibuat di table fileUser",
      data: fileUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

export default router;
