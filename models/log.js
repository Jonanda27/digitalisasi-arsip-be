import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  email: { type: String },
  kategori: {
    type: String, 
    required: true,
  },
  aktivitas: {
    type: String, 
    required: true,
  },
  status: {
    type: String,
    enum: ["sukses", "gagal"],
    default: "sukses",
  },
  waktu: {
    type: Date,
    default: Date.now,
  },
});

// GANTI BAGIAN INI:
const Log = mongoose.model("Log", LogSchema);
export default Log;