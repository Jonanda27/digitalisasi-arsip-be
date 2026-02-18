import express from "express";
import multer from "multer";
import File from "../models/file.js";
import Folder from "../models/folder.js";
import { runOCR } from "../services/ocr.service.js";
import { authRequired } from "../middleware/auth.js";
import path from "path";
import fs from "fs";
import AccessRequest from "../models/accessRequest.js";
import mongoose from "mongoose";


const router = express.Router();

/* multer config */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Menghapus spasi dan karakter aneh di sisi server
    const safeName = file.originalname.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    cb(null, Date.now() + '-' + safeName);
  }
});

const upload = multer({ storage });

router.post(
  "/createFile",
  upload.array("files", 10),
  async (req, res) => {

    
    const {
      folder,

      namaFile,
      bidang,
      subBidang,
      noUrut,
      unitKerja,
      tahun,
      noDokumenPreview,
      kantorBidang,
      noRak,
      lokasi,
      kategori,
      namaInstansi,
      nomorSurat,
      perihal,
      kerahasiaan,
      tipeDokumen,
      noArsip,
      noArsipPreview,
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "File diperlukan" });
    }

    try {
      const savedFiles = [];

      for (const file of req.files) {
        // ===== SIMPAN AWAL =====
        const doc = await File.create({
          name: file.filename,
          originalName: file.originalname,
          folder: folder || null,

          path: file.path,
          mimetype: file.mimetype,
          size: file.size,

          // ===== METADATA =====
          namaFile,
          bidang,
          subBidang,
          noUrut,
          unitKerja,
          tahun,
          noDokumenPreview,
          kantorBidang,
          noRak,
          lokasi,
          kategori,
          namaInstansi,
          nomorSurat,
          perihal,
          kerahasiaan,
          tipeDokumen,
          noArsip,
          noArsipPreview,

          // ===== OCR =====
          ocrStatus: "processing",
        });

        try {
          const text = await runOCR(file.path, file.mimetype);

          doc.ocrText = text;
          doc.ocrStatus = "done";
          await doc.save();
        } catch (ocrErr) {
          console.error("OCR error:", ocrErr);

          doc.ocrStatus = "failed";
          await doc.save();
        }

        savedFiles.push(doc);
      }

      res.status(201).json({
        message: "Upload + OCR selesai",
        files: savedFiles,
      });
    } catch (err) {
      console.error("Create file error:", err);

      res.status(500).json({
        message: "Terjadi kesalahan server",
      });
    }
  }
);

router.get("/filter", async (req, res) => {
  try {
    const { q, tahun, kerahasiaan, tipeDokumen, kategori } = req.query;

    // Gunakan kriteria wajib status final
    let criteria = [{ status: "final" }];

    // Filter Kategori (Exact Match)
    if (kategori && kategori.trim() !== "") {
      criteria.push({ kategori: kategori });
    }

    // Filter Tahun (Exact Match String)
    if (tahun && tahun.trim() !== "") {
      criteria.push({ tahun: String(tahun) });
    }

    // Filter Kerahasiaan
    if (kerahasiaan && kerahasiaan.trim() !== "") {
      criteria.push({ kerahasiaan: kerahasiaan });
    }

    // Filter Tipe Dokumen
    if (tipeDokumen && tipeDokumen.trim() !== "") {
      criteria.push({ tipeDokumen: tipeDokumen });
    }

    // Logika Pencarian
    if (q && q.trim() !== "") {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
      criteria.push({
        $or: [
          { namaFile: regex },
          { nomorSurat: regex },
          { ocrText: regex }
        ]
      });
    }

    // Eksekusi dengan $and
    const finalQuery = { $and: criteria };

    // DEBUG UNTUK ANDA: Cek terminal backend!
    console.log("MENJALANKAN QUERY:", JSON.stringify(finalQuery, null, 2));

    const files = await File.find(finalQuery).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: files.length,
      files
    });

  } catch (err) {
    console.error("Filter error:", err);
    res.status(500).json({ message: "Gagal memfilter data" });
  }
});

router.post('/updateStatus', async (req, res) => {
  const { fileId, status } = req.body;

  if (!fileId || !status) {
    return res.status(400).json({ message: "ID file dan status diperlukan." });
  }

  try {
    // Cek apakah status yang dikirim adalah 'final'
    if (status !== 'final') {
      return res.status(400).json({ message: "Status yang valid hanya 'final'." });
    }

    // Cari file berdasarkan ID di database
    const file = await File.findById(fileId); // Sesuaikan dengan schema yang digunakan

    if (!file) {
      return res.status(404).json({ message: "File tidak ditemukan." });
    }

    // Update status menjadi 'final'
    file.status = 'final';  // Memastikan status diubah menjadi 'final'
    await file.save(); // Simpan perubahan ke database

    res.status(200).json({ message: "Status file berhasil diperbarui menjadi final.", status: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal memperbarui status file." });
  }
});


/* FETCH FILE */
// routes/files.js atau routes/pencarian.js

router.get("/fetchFile", authRequired, async (req, res) => {
  try {
    // Pastikan req.user ada (dari middleware auth)
    const userId = req.user?.id || req.user?._id; 
    
    if (!userId) {
      return res.status(401).json({ message: "User tidak terautentikasi" });
    }

    const allFiles = await File.find({}).lean();
    const myApprovedRequests = await AccessRequest.find({
      user: userId,
      status: "approved"
    }).lean();

    const approvedFileIds = myApprovedRequests.map(req => 
      req.file ? req.file.toString() : null
    ).filter(id => id !== null);

    const filesWithStatus = allFiles.map(file => {
      const isUmum = file.kerahasiaan?.toLowerCase() === "umum";
      const hasAccess = approvedFileIds.includes(file._id.toString());
      
      // PERBAIKAN DI SINI: Tambahkan pengecekan jika favoritedBy tidak ada
      const isFav = (file.favoritedBy && Array.isArray(file.favoritedBy)) 
        ? file.favoritedBy.some(id => id.toString() === userId.toString())
        : false;

      return {
        ...file,
        isFavorite: isFav, 
        hasApprovedAccess: isUmum || hasAccess
      };
    });

    res.json({ files: filesWithStatus });
  } catch (error) {
    console.error("Error fetchFile Detail:", error); // Cek terminal backend Anda untuk detail errornya
    res.status(500).json({ message: "Gagal mengambil data file", error: error.message });
  }
});

router.get("/fetchKabanFile", authRequired, async (req, res) => {
  try {
    // Pastikan req.user ada (dari middleware auth)
    const userId = req.user?.id || req.user?._id; 
    
    if (!userId) {
      return res.status(401).json({ message: "User tidak terautentikasi" });
    }

    // Ambil semua file kaban (tanpa pengecekan akses)
    const allFiles = await File.find({}).lean();

    // Filter file yang terkait dengan kaban
    const kabanFiles = allFiles.filter(file => file.category && file.category.toLowerCase() === "kaban");

    // Pengecekan apakah file tersebut difavoritkan oleh user
    const filesWithFavStatus = kabanFiles.map(file => {
      const isFav = (file.favoritedBy && Array.isArray(file.favoritedBy)) 
        ? file.favoritedBy.some(id => id.toString() === userId.toString())
        : false;

      return {
        ...file,
        isFavorite: isFav
      };
    });

    res.json({ files: filesWithFavStatus });
  } catch (error) {
    console.error("Error fetchKabanFile Detail:", error); // Cek terminal backend Anda untuk detail errornya
    res.status(500).json({ message: "Gagal mengambil data file kaban", error: error.message });
  }
});


router.get("/fetchFileAdmin", authRequired, async (req, res) => {
  try {
    // Pengecekan role dihapus, hanya mengandalkan authRequired
    const { folder } = req.query;
    let queryFilter = {};

    // Logika Kondisional: 
    // Jika di root (folder null/undefined), ambil SEMUA file
    // Jika di dalam folder, ambil file sesuai folder tersebut
    if (!folder || folder === "null" || folder === "undefined") {
      queryFilter = {}; 
    } else {
      queryFilter = { folder: folder };
    }

    const files = await File.find(queryFilter).lean();

    // Mapping agar frontend tahu file ini bisa dibuka
    const processedFiles = files.map(file => ({
      ...file,
      hasApprovedAccess: true 
    }));

    res.json({ files: processedFiles });
  } catch (error) {
    console.error("Error fetchFileAdmin:", error);
    res.status(500).json({ message: "Gagal mengambil data" });
  }
});



router.get("/search", async (req, res) => {
  try {
    const { q, folder } = req.query;

    if (!q || q.trim() === "") {
      return res.json({ files: [] });
    }

    // --- 1. Helper Function untuk Fuzzy Regex ---
    const createFuzzyPattern = (text) => {
        // Hapus karakter spesial regex agar aman
        const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Logic penggantian karakter (Fuzzy Map)
        // Kita pecah string per huruf, lalu cek apakah huruf itu punya "kembaran" bunyi
        return escaped.split('').map(char => {
            const lower = char.toLowerCase();
            switch (lower) {
                case 'a': return '[aàáâãäå4@]'; // a mirip 4 atau @
                case 'e': return '[eèéêë3]';    // e mirip 3
                case 'i': return '[iìíîï1l]';   // i mirip 1 atau L kecil
                case 'o': return '[oòóôõö0]';   // o mirip 0
                case 's': return '[scz$5]';     // s mirip c, z, $, 5 (MENANGANI SOSIAL/SOCIAL)
                case 'c': return '[cs]';        // c mirip s (MENANGANI SOCIAL/SOSIAL)
                case 'k': return '[kq]';        // k mirip q
                case 'f': return '[fv]';        // f mirip v
                case 'v': return '[vf]';        // v mirip f
                case 'j': return '[jz]';        // j mirip z
                case ' ': return '[\\s\\-_]+';  // Spasi bisa berarti dash atau underscore
                default: return char;
            }
        }).join('.*'); // Gunakan '.*' di antara huruf jika ingin menangani huruf yg hilang (opsional)
        // Atau gunakan .join('') jika ingin panjang katanya harus sama persis.
        // Rekomendasi saya gunakan .join('') untuk akurasi, atau .join('.*') untuk sangat loose.
        // Untuk kasus "social" vs "sosial", .join('') sudah cukup dengan mapping di atas.
    };

    // --- 2. Terapkan Pattern ---
    // Misal user ketik "social", ini akan jadi regex: /[scz$5][o...][cs][i...][a...][l...]/i
    const fuzzyString = createFuzzyPattern(q); 
    const regex = new RegExp(fuzzyString, "i");

    const query = {
      $or: [
        { name: regex },
        { originalName: regex },
        { ocrText: regex },
      ],
    };

    if (folder) {
      query.folder = folder;
    }

    const files = await File.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ files });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Search failed" });
  }
});



router.patch("/:id/favorite", authRequired, async (req, res) => {
  try {
    const userId = req.user._id; // Atau req.user.id, tergantung middleware Anda
    const fileId = req.params.id;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Cek apakah user sudah memfavoritkan file ini
    const isFavorited = file.favoritedBy.includes(userId);

    if (isFavorited) {
      // Jika sudah ada, hapus user ID dari array (Unfavorite)
      await File.updateOne(
        { _id: fileId },
        { $pull: { favoritedBy: userId } }
      );
    } else {
      // Jika belum ada, tambahkan user ID ke array (Favorite)
      // $addToSet memastikan tidak ada duplikasi ID
      await File.updateOne(
        { _id: fileId },
        { $addToSet: { favoritedBy: userId } }
      );
    }

    // Return status terbaru ke frontend
    res.json({
      message: isFavorited ? "Dihapus dari favorit" : "Ditambahkan ke favorit",
      isFavorite: !isFavorited, // Kirim status boolean balik ke frontend agar UI update
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal update favorite" });
  }
});


router.get("/favorites", authRequired, async (req, res) => {
  try {
    const { folder, tipe, akses, urutkan, q } = req.query;
    const userId = req.user._id; // Ambil ID user dari token

    // Filter dasar: Cari file yang array 'favoritedBy'-nya mengandung userId
    const filter = { favoritedBy: userId }; 

    if (folder) filter.folder = folder;
    if (tipe) filter.tipeDokumen = tipe;
    if (akses) filter.kerahasiaan = akses;

    // Search logic (Fuzzy) - Sama seperti sebelumnya
    if (q && q.trim() !== "") {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, "i");
      filter.$or = [
        { name: regex },
        { originalName: regex },
        { ocrText: regex },
        { nomorSurat: regex }
      ];
    }

    // Sort logic - Sama seperti sebelumnya
    let sortOptions = { createdAt: -1 };
    if (urutkan === "judul_asc") sortOptions = { originalName: 1 };
    if (urutkan === "judul_desc") sortOptions = { originalName: -1 };
    if (urutkan === "tahun_desc") sortOptions = { tahun: -1 };
    if (urutkan === "tahun_asc") sortOptions = { tahun: 1 };

    // Ambil data
    const files = await File.find(filter).sort(sortOptions).lean(); 
    // .lean() mengubah hasil jadi object JS biasa (bukan Mongoose Document), lebih cepat

    // Transformasi data untuk frontend
    // Frontend butuh properti 'isFavorite: true' untuk menampilkan bintang kuning
    const filesWithStatus = files.map(file => ({
      ...file,
      isFavorite: true // Karena ini endpoint /favorites, sudah pasti true
    }));

    res.json({ files: filesWithStatus });
  } catch (err) {
    console.error("Fetch favorites error:", err);
    res.status(500).json({ message: "Gagal mengambil file favorit" });
  }
});

router.get("/:id/preview", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const filePath = path.resolve(file.path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not exists in storage" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${file.originalName}"`
    );

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    console.error("Preview error:", err);
    res.status(500).json({ message: "Preview failed" });
  }
});

router.get("/filter", async (req, res) => {
  try {
    const { folder, tipe, akses, urutkan, q } = req.query;

    // 1. Inisialisasi Filter
    let filter = {};

    // Filter berdasarkan Folder (jika ada)
    if (folder) filter.folder = folder;

    // Filter berdasarkan Tipe Dokumen (Digital/Analog)
    // Field di Schema: tipeDokumen
    if (tipe) filter.tipeDokumen = tipe;

    // Filter berdasarkan Akses (Umum/Terbatas/Rahasia)
    // Field di Schema: kerahasiaan
    if (akses) filter.kerahasiaan = akses;

    // 2. Logic Pencarian (Search) - Menggunakan Fuzzy dari code Anda sebelumnya
    if (q && q.trim() !== "") {
      const createFuzzyPattern = (text) => {
        const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return escaped.split('').map(char => {
          const lower = char.toLowerCase();
          switch (lower) {
            case 'a': return '[a4@]';
            case 'e': return '[e3]';
            case 'i': return '[i1l]';
            case 'o': return '[o0]';
            case 's': return '[scz5]';
            case 'c': return '[cs]';
            case ' ': return '[\\s\\-_]+';
            default: return char;
          }
        }).join(''); // join empty agar lebih akurat sesuai saran sebelumnya
      };

      const regex = new RegExp(createFuzzyPattern(q), "i");
      filter.$or = [
        { originalName: regex },
        { namaFile: regex },
        { ocrText: regex },
        { nomorSurat: regex }
      ];
    }

    // 3. Logic Pengurutan (Sorting)
    let sortOptions = { createdAt: -1 }; // Default: Terbaru

    if (urutkan) {
      switch (urutkan) {
        case "judul_asc":
          sortOptions = { originalName: 1 };
          break;
        case "judul_desc":
          sortOptions = { originalName: -1 };
          break;
        case "tahun_desc":
          sortOptions = { tahun: -1 };
          break;
        case "tahun_asc":
          sortOptions = { tahun: 1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }
    }

    // 4. Eksekusi Query
    const files = await File.find(filter)
      .sort(sortOptions)
      .limit(100); // Batasi hasil untuk performa

    res.json({
      success: true,
      count: files.length,
      files
    });

  } catch (err) {
    console.error("Filter error:", err);
    res.status(500).json({ message: "Gagal memfilter data" });
  }
});

/* STATISTIK ROOT FOLDER (REKURSIF) - FIXED */
router.get("/root-statistics-recursive", async (req, res) => {
  try {
    // 1. Ambil semua folder root
    const rootFolders = await Folder.find({ parent: null }).lean();

    // Fungsi pembantu untuk mengambil semua ID sub-folder secara rekursif
    const getAllChildFolderIds = async (parentFolderId) => {
      let ids = [parentFolderId.toString()]; // Pastikan dalam bentuk string/ID
      const children = await Folder.find({ parent: parentFolderId }).select("_id").lean();
      
      for (const child of children) {
        const childIds = await getAllChildFolderIds(child._id);
        ids = ids.concat(childIds);
      }
      return ids;
    };

    const statistics = await Promise.all(
      rootFolders.map(async (folder) => {
        const allFolderIds = await getAllChildFolderIds(folder._id);

        // 2. Gunakan filter case-insensitive untuk kerahasiaan
        // Kita hitung menggunakan agregasi agar lebih pasti dalam satu kali jalan
        const fileStats = await File.aggregate([
          { 
            $match: { 
              folder: { $in: allFolderIds.map(id => new mongoose.Types.ObjectId(id)) } 
            } 
          },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              umum: {
                $sum: { $cond: [{ $eq: [{ $toLower: "$kerahasiaan" }, "umum"] }, 1, 0] }
              },
              rahasia: {
                $sum: { $cond: [{ $eq: [{ $toLower: "$kerahasiaan" }, "rahasia"] }, 1, 0] }
              },
              terbatas: {
                $sum: { $cond: [{ $eq: [{ $toLower: "$kerahasiaan" }, "terbatas"] }, 1, 0] }
              },
              // Ambil semua ID file untuk hitung request di tahap berikutnya
              fileIds: { $push: "$_id" }
            }
          }
        ]);

        const result = fileStats[0] || { total: 0, umum: 0, rahasia: 0, terbatas: 0, fileIds: [] };

        // 3. Hitung jumlah request berdasarkan file-file yang ditemukan
        const totalRequests = await AccessRequest.countDocuments({
          file: { $in: result.fileIds }
        });

        return {
          _id: folder._id,
          name: folder.name,
          kode: folder.kode,
          stats: {
            totalFiles: result.total,
            byKerahasiaan: {
              umum: result.umum,
              rahasia: result.rahasia,
              terbatas: result.terbatas
            },
            totalAccessRequests: totalRequests
          }
        };
      })
    );

    res.json({
      success: true,
      data: statistics
    });
  } catch (err) {
    console.error("Error root statistics recursive:", err);
    res.status(500).json({ message: "Gagal mengambil statistik", error: err.message });
  }
});



export default router;
