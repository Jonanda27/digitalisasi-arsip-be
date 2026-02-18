import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  nip: { type: String },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  bidang: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Folder", 
    required: false 
  },
  no_hp: { type: String }, // Field Baru
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("User", userSchema);