import multer from "multer";
import path from "path";
import fs from "fs";

const draftDir = "uploads/drafts";
fs.mkdirSync(draftDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, draftDir),
  filename: (_, file, cb) => {
    const safeName = file.originalname.replace(/[<>:"/\\|?*]/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

export const uploadDraft = multer({ storage });
