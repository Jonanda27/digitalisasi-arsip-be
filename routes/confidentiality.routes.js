import express from "express";
import DocumentConfidentiality from "../models/documentConfidentiality.js";

const router = express.Router();

router.get("/confidentiality", async (req, res) => {
  try {
    const list = await DocumentConfidentiality.find().sort({ code: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil tingkat kerahasiaan" });
  }
});

export default router;
