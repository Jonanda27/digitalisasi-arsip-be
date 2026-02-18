import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  // ===== File Info =====
  name: { type: String, required: true },
  originalName: { type: String },

  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
    default: null,
  },

  path: { type: String, required: true },
  mimetype: { type: String },
  size: { type: Number },

  // ===== Metadata Arsip =====
  namaFile: { type: String },

  bidang: { type: String },
  subBidang: { type: String },

  noUrut: { type: String },

  unitKerja: {
    type: String,
    default: "BAPENDA",
  },

  tahun: {
    type: String,
    default: "2024",
  },

  noDokumenPreview: { type: String },

  kantorBidang: { type: String },

  noRak: { type: String },

  lokasi: { type: String },

  kategori: { type: String },

  namaInstansi: { type: String },

  nomorSurat: { type: String },

  perihal: { type: String },

  kerahasiaan: { type: String },

  tipeDokumen: { type: String },

  noArsip: { type: String },

  noArsipPreview: { type: String },

   // ===== FAVORIT =====
 favoritedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Sesuaikan dengan nama model User Anda
  }],

   status: {
      type: String,
      enum: ["draft", "final"],
      default: "final",
      index: true,
    },


  // ===== Timestamp =====
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("File", fileSchema);
