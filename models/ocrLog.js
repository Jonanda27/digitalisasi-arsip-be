import mongoose from "mongoose";

const OCRLogSchema = new mongoose.Schema({
  scannedAt: { type: Date, default: Date.now },
  status: { type: String, default: "success" }
});

export const OCRLog = mongoose.model("OCRLog", OCRLogSchema);