import express from "express";
import DocumentType from "../models/documentType.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const list = await DocumentType.find().sort({ code: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil tipe dokumen" });
  }
});

export default router;
