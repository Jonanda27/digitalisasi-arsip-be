import mongoose from "mongoose";

const DocumentConfidentialitySchema = new mongoose.Schema(
  {
    code: {
      type: String, // string supaya bisa "01" jika mau
      required: true,
      unique: true,
      match: /^[0-9]+$/,
    },

    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "DocumentConfidentiality",
  DocumentConfidentialitySchema
);
