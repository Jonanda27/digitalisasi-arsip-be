import express from "express";
import ArsipCounter from "../models/arsipCounter.js";

const router = express.Router();

router.get("/next-number", async (req, res) => {
  try {
    const { bidang, tahun } = req.query;

    if (!bidang || !tahun) {
      return res.status(400).json({ message: "bidang & tahun wajib" });
    }

    const counter = await ArsipCounter.findOneAndUpdate(
      { bidang, tahun },
      { $inc: { lastNumber: 1 } },
      { new: true, upsert: true }
    );

    res.json({
      noUrut: counter.lastNumber.toString().padStart(3, "0"),
    });
  } catch (err) {
    console.error("NEXT NUMBER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
