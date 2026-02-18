import express from "express";
import DocumentCategory from "../models/documentCategory.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const list = await DocumentCategory.find().sort({ code: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil kategori" });
  }
});

export default router;
