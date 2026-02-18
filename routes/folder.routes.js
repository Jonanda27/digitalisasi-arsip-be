import express from "express";
import Folder from "../models/folder.js";
import File from "../models/file.js";
import Counter from "../models/counter.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

router.get("/all-folders", async (req, res) => {
  try {
    // Filter hanya folder yang tidak memiliki parent (Level 0 / Root)
    const folders = await Folder.find({ parent: null }).select("name _id kode"); 
    
    res.json(folders);
  } catch (error) {
    console.error("Error fetch folders:", error);
    res.status(500).json({ message: "Gagal mengambil data folder bidang" });
  }
});


router.post("/createFol", async (req, res) => {
  const { name, parent } = req.body;

  if (!name)
    return res
      .status(400)
      .json({ message: "Nama folder diperlukan" });

  try {
    // 🔥 ambil counter global folder
    const counter = await Counter.findOneAndUpdate(
      { key: "folder" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const kode = String(counter.seq).padStart(3, "0");

    const folder = await Folder.create({
      name,
      kode,
      parent: parent || null,
    });

    res.status(201).json({
      message: "Folder berhasil dibuat",
      folder,
    });
  } catch (err) {
    console.error("Create folder error:", err);

    res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
});

/* FETCH BY PARENT + COUNT */
router.get("/by-parent-with-count", async (req, res) => {
  const { parent } = req.query;

  try {
    const folders = await Folder.find({
      parent: parent || null,
    });

    const result = await Promise.all(
      folders.map(async (folder) => {
        const subCount = await Folder.countDocuments({
          parent: folder._id,
        });

        const fileCount = await File.countDocuments({
          folder: folder._id,
        });

        return {
          ...folder.toObject(),
          itemCount: subCount + fileCount,
        };
      })
    );

    res.json({ folders: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

/* DELETE FOLDER RECURSIVE */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const folder = await Folder.findById(id);

    if (!folder)
      return res.status(404).json({ message: "Folder tidak ditemukan" });

    const deleteRecursive = async (folderId) => {
      await File.deleteMany({ folder: folderId });

      const children = await Folder.find({ parent: folderId });

      for (const child of children) {
        await deleteRecursive(child._id);
      }

      await Folder.findByIdAndDelete(folderId);
    };

    await deleteRecursive(id);

    res.json({ message: "Folder berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus folder" });
  }
});

router.get("/user-root/:bidangId", async (req, res) => {
  try {
    const { bidangId } = req.params;
    
    // Cari folder yang menjadi root-nya bidang tersebut
    const folder = await Folder.findById(bidangId);
    
    if (!folder) {
      return res.status(404).json({ message: "Folder bidang tidak ditemukan" });
    }

    // Kembalikan folder bidang tersebut sebagai satu-satunya item di root
    res.json({ folders: [folder] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/terb/:id", authRequired, async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({ message: "Folder tidak ditemukan" });
    }

    // Mengirimkan seluruh data folder (termasuk field 'name' yang Anda butuhkan)
    res.status(200).json(folder);
  } catch (error) {
    console.error("Error Fetch Folder By ID:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// GET root folder
router.get("/root", async (req, res) => {
  const folders = await Folder.find({ parent: null });
  res.json({ folders });
});

// GET by parent
router.get("/by-parent", async (req, res) => {
  const { parent } = req.query;
  const folders = await Folder.find({ parent });
  res.json({ folders });
});


/* PING */
router.get("/ping", (req, res) => {
  res.send("FOLDER ROUTE OK");
});

export default router;
