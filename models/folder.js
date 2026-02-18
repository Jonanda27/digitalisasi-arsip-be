import mongoose from "mongoose";

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },

  // 🔥 kode unik otomatis
  kode: { type: String, required: true, unique: true },

  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
    default: null,
  },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Folder", folderSchema);
