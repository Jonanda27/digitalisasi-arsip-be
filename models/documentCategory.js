import mongoose from "mongoose";

const DocumentCategorySchema = new mongoose.Schema(
  {
    code: {
      type: String, // tetap string supaya bisa "01"
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
  "DocumentCategory",
  DocumentCategorySchema
);
