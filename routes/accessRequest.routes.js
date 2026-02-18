// routes/accessRequest.routes.js
import express from "express";
import AccessRequest from "../models/accessRequest.js";
import { authRequired } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import { formatWIT } from "../utils/formatDate.js";
import File from "../models/file.js";
import mongoose from "mongoose";

const router = express.Router();


router.post("/akses", authRequired, async (req, res) => {
  try {
    const { fileId, keperluan, lamaAkses } = req.body;

    // 1. Cari file untuk mendapatkan data kerahasiaan
    const fileData = await File.findById(fileId); // Asumsi model File Anda bernama 'File'
    
    if (!fileData) {
      return res.status(404).json({ message: "File tidak ditemukan" });
    }

    // 2. Buat permintaan akses dengan menyertakan data kerahasiaan dari file
    const request = await AccessRequest.create({
      file: fileId,
      user: req.user._id,
      keperluan,
      lamaAkses,
      tingkatKerahasiaan: fileData.kerahasiaan, // Menyimpan snapshot tingkat kerahasiaan saat diminta
    });

    res.status(201).json({
      message: "Permintaan akses berhasil dikirim",
      data: request,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/", authRequired, async (req, res) => {
  try {
    const { status, akses, q } = req.query;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Sesi tidak valid." });
    }

    // 1. Query Dasar: Milik user yang login
    let query = { user: req.user._id };

    // 2. Filter Status (Pending, Approved, Rejected)
    if (status) {
      // Mapping jika FE mengirim "menunggu" tapi di DB "pending"
      let statusMap = status;
      if (status === "menunggu") statusMap = "pending";
      if (status === "disetujui") statusMap = "approved";
      if (status === "ditolak") statusMap = "rejected";
      query.status = statusMap;
    }

    // 3. Filter Akses/Kerahasiaan (Umum, Terbatas, Rahasia)
    // Karena kerahasiaan ada di model File, kita perlu filter setelah populate 
    // atau gunakan teknik match di populate.
    let fileMatch = {};
    if (akses) {
      fileMatch.kerahasiaan = akses;
    }

    // 4. Logic Pencarian (Fuzzy pada Nama File)
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
      fileMatch.namaFile = regex;
    }

    const requests = await AccessRequest.find(query)
      .populate({
        path: "file",
        match: fileMatch, // Hanya ambil file yang sesuai kriteria filter
        select: "namaFile kerahasiaan"
      })
      .sort({ createdAt: -1 });

    // Karena kita memfilter di dalam populate (match), 
    // Mongoose akan mengembalikan { file: null } jika file tidak cocok.
    // Kita harus membuang data request yang file-nya null akibat filter tersebut.
    const filteredRequests = requests.filter(r => r.file !== null);

    res.json(filteredRequests);
  } catch (err) {
    console.error("ERROR API:", err);
    res.status(500).json({ message: "Gagal mengambil data", error: err.message });
  }
});


router.patch("/:id", async (req, res) => {
  const { status } = req.body;

  const request = await AccessRequest.findByIdAndUpdate(
    req.params.id,
    {
      status,
      approvedAt: status === "approved" ? new Date() : null,
    },
    { new: true }
  );

  res.json({
    message: "Status permintaan diperbarui",
    data: {
      ...request.toObject(),
      tanggalDisetujui: formatWIT(request.approvedAt),
    },
  });
});

router.get("/pending", authRequired, requireRole(["admin", "kaban", "scanner","pegawai"]), async (req, res) => {
  try {
    const requests = await AccessRequest.find({ status: "pending" })
      .populate("file", "namaFile kerahasiaan")
      .populate("user", "nama email")
      .sort({ createdAt: -1 });

    // Gunakan filter untuk membuang request yang datanya sudah tidak lengkap (opsional)
    // Atau gunakan optional chaining (?.) agar tidak crash
    const formatted = requests.map((r) => ({
      _id: r._id,
      file: r.file ? {
        _id: r.file._id,
        namaFile: r.file.namaFile,
        kerahasiaan: r.file.kerahasiaan,
      } : null, // Jika file dihapus, berikan null
      user: r.user ? {
        _id: r.user._id,
        nama: r.user.nama,
        email: r.user.email,
      } : null, // Jika user dihapus, berikan null
      keperluan: r.keperluan,
      lamaAkses: r.lamaAkses,
      status: r.status,
      tanggalDiajukan: formatWIT(r.createdAt),
      tanggalDisetujui: r.approvedAt ? formatWIT(r.approvedAt) : null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Detail Error Backend:", err); // Tambahkan ini agar muncul di terminal server
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Update status request (approve / reject)
router.patch("/:id", authRequired, requireRole(["admin", "kaban", "scanner"]), async (req, res) => {
  try {
    const { status, catatanAdmin } = req.body;

    if (!["approved", "rejected"].includes(status.toLowerCase())) {
      return res.status(400).json({ message: "Status harus 'approved' atau 'rejected'" });
    }

    const request = await AccessRequest.findById(req.params.id).populate("file", "namaFile kerahasiaan");

    if (!request) {
      return res.status(404).json({ message: "Request tidak ditemukan" });
    }

    request.status = status.toLowerCase();
    request.catatanAdmin = catatanAdmin || null;
    request.approvedAt = status.toLowerCase() === "approved" ? new Date() : null;

    await request.save();

    res.json({
      message: `Permintaan akses berhasil ${status.toLowerCase()}`,
      data: {
        _id: request._id,
        file: request.file,
        user: request.user,
        keperluan: request.keperluan,
        lamaAkses: request.lamaAkses,
        status: request.status,
        catatanAdmin: request.catatanAdmin,
        tanggalDiajukan: formatWIT(request.createdAt),
        tanggalDisetujui: request.approvedAt ? formatWIT(request.approvedAt) : null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/approved", authRequired, async (req, res) => {
  try {
    const requests = await AccessRequest.find({
      user: req.user._id,
      status: "approved"
    }).populate("file");

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil data" });
  }
});



export default router;
