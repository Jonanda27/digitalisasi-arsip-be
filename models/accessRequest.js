import mongoose from "mongoose";

const accessRequestSchema = new mongoose.Schema({
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
    required: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // 🔥 PENTING
    required: true,
  },

  keperluan: {
    type: String,
    required: true,
  },
  

  lamaAkses: {
    type: Number, // hari
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  approvedAt: Date,
  expiredAt: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("AccessRequest", accessRequestSchema);
