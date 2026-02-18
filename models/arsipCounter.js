import mongoose from "mongoose";

const ArsipCounterSchema = new mongoose.Schema({
  bidang: String,
  tahun: String,
  lastNumber: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("ArsipCounter", ArsipCounterSchema);
