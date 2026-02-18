import mongoose from "mongoose";

const fileUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  originalName: { type: String },
  path: { type: String, required: true },
  mimetype: { type: String },
  size: { type: Number },

  folder: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: null },

  // Metadata form
  namaFile: String,
  bidang: String,
  subBidang: String,
  unitKerja: String,
  tahun: String,
  noDokumenPreview: String,
  kantorBidang: String,
  noRak: String,
  lokasi: String,
  kategori: String,
  namaInstansi: String,
  nomorSurat: String,
  perihal: String,
  kerahasiaan: String,
  tipeDokumen: String,
  noArsip: String,
  noArsipPreview: String,

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("FileUser", fileUserSchema);
