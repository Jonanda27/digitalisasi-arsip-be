import mongoose from "mongoose";

const subBidangSchema = new mongoose.Schema({
  bidang_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Bidang", 
    required: true 
  },
  nama_sub_bidang: { type: String, required: true }
});

export default mongoose.model("SubBidang", subBidangSchema);