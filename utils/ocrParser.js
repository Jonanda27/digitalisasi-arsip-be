export function extractMetadata(text) {
  const lower = text.toLowerCase();

  return {
    nomorSurat: text.match(/nomor\s*[:\-]\s*(.+)/i)?.[1] || "",
    perihal: text.match(/perihal\s*[:\-]\s*(.+)/i)?.[1] || "",
    namaInstansi: text.split("\n")[0] || "",

    kerahasiaan: lower.includes("rahasia")
      ? "Rahasia"
      : lower.includes("terbatas")
      ? "Terbatas"
      : "Umum",

    kategori: lower.includes("laporan")
      ? "Laporan"
      : lower.includes("keuangan")
      ? "Keuangan"
      : lower.includes("sop")
      ? "SOP"
      : lower.includes("surat")
      ? "Surat"
      : "",
  };
}
