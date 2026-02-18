import express from "express";
import File from "../models/file.js";
import { uploadDraft } from "../middleware/uploadDraft.js";

const router = express.Router();

/**
 * ===============================
 * SIMPAN DRAFT DOKUMEN
 * ===============================
 */
router.post(
  "/save-draft",
  uploadDraft.single("files"),
  async (req, res) => {
    try {
      // Check if file is uploaded
      if (!req.file) {
        return res.status(400).json({ message: "File tidak ditemukan" });
      }

      // Ensure the folder ID is passed in the body
      const { folder } = req.body;
      if (!folder) {
        return res.status(400).json({ message: "Folder tidak ditemukan" });
      }
      console.log("Folder dari request body:", req.body.folder);

      // Create the draft object with the folder ID
      const draft = new File({
        ...req.body,
        status: "draft",
        path: req.file.path,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        name: req.body.namaFile || req.file.originalname,
        folder: folder, // Set the folder ID here
        createdBy: req.user?.id || null,
      });

      // Save the draft in the database
      await draft.save();

      // Return success response with the saved draft
      res.status(201).json({
        message: "Draft berhasil disimpan",
        data: draft,
      });
    } catch (err) {
      console.error("SAVE DRAFT ERROR:", err);
      res.status(500).json({ message: "Gagal menyimpan draft" });
    }
  }
);

router.get("/drafts", async (req, res) => {
  const drafts = await File.find({
    status: "draft",
    createdBy: req.user?.id,
  }).sort({ updatedAt: -1 });

  const mapped = drafts.map((d) => ({
    ...d.toObject(),
    filePath: d.path, // 🔥 ALIAS WAJIB
  }));

  res.json(mapped);
});

router.get("/total-drafts", async (req, res) => {
  try {
    // Menghitung jumlah semua file yang statusnya 'draft' tanpa memandang user
    const count = await File.countDocuments({ status: "draft" });

    res.json({
      success: true,
      totalDrafts: count,
    });
  } catch (err) {
    console.error("GET TOTAL DRAFT ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal menghitung draft" });
  }
});



export default router;
