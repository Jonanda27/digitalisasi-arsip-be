import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import Tesseract from "tesseract.js";
import { createRequire } from "module";

const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

// backend/services/ocrService.js
export const runOCR = async (filePath, mimetype, maxPages = 3) => {
  const absPath = path.resolve(process.cwd(), filePath);
  const tmpDir = path.resolve(process.cwd(), "uploads/tmp");

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  if (mimetype === "application/pdf") {
    const buffer = fs.readFileSync(absPath);

    // 1. Coba text layer (ambil maxPages pertama)
    try {
      const data = await pdfParse(buffer, { max: maxPages });
      if (data.text && data.text.trim().length > 100) {
        return data.text;
      }
    } catch (err) {
    }

    // 2. Jika PDF Scan, konversi hal 1 sampai maxPages ke PNG
    const prefix = path.join(tmpDir, `page-${Date.now()}`);
    
    // -f 1 (halaman mulai), -l (halaman akhir)
    await execFileAsync("pdftoppm", [
      "-png", 
      "-f", "1", 
      "-l", maxPages.toString(), 
      absPath, 
      prefix
    ]);

    const images = fs.readdirSync(tmpDir)
      .filter((f) => f.includes(path.basename(prefix)) && f.endsWith(".png"))
      .sort(); // Urutkan agar teks tidak berantakan

    let fullText = "";
    for (const img of images) {
      const imgPath = path.join(tmpDir, img);
      const { data: { text } } = await Tesseract.recognize(imgPath, "ind+eng");
      fullText += `\n--- PAGE --- \n${text}`;
      fs.unlinkSync(imgPath); // Hapus file temp setelah dibaca
    }

    return fullText;
  }

  // IMAGE tetap sama
  if (mimetype.startsWith("image/")) {
    const { data: { text } } = await Tesseract.recognize(absPath, "ind+eng");
    return text;
  }

  return "";
};
