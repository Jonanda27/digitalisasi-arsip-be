import { runOCR } from "./services/ocr.service.js";

const run = async () => {
  const text = await runOCR(
    "uploads/1769139326308-CV Jonanda (2).pdf",
    "application/pdf"
  );

  console.log("===== OCR RESULT =====");
  console.log(text.substring(0, 1000));
};

run();
