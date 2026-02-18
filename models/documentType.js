import mongoose from "mongoose";

const DocumentTypeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
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
  "DocumentType",
  DocumentTypeSchema
);
