import pdf from "pdf-poppler";
import path from "path";
import fs from "fs";

export async function convertPDFToImages(pdfPath) {
  const outDir = path.dirname(pdfPath);

  const opts = {
    format: "png",
    out_dir: outDir,
    out_prefix: path.basename(pdfPath, path.extname(pdfPath)),
    page: null,
  };

  await pdf.convert(pdfPath, opts);

  const files = fs
    .readdirSync(outDir)
    .filter((f) => f.startsWith(opts.out_prefix));

  return files.map((f) => path.join(outDir, f));
}
