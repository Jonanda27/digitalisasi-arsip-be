import mongoose from "mongoose";

const bidangSchema = new mongoose.Schema({
  nama_bidang: { type: String, required: true }
});

export default mongoose.model("Bidang", bidangSchema);