import mongoose from "mongoose";
import Folder from "../models/folder.js"; // Pastikan path sesuai

const dataMaster = [
  {
    nama_bidang: "PBB BPHTB",
    subs: [
      "Sub Bidang Pendataan dan Pendaftaran PBB dan BPHTB",
      "Sub Bidang Penilaian dan Penetapan PBB dan BPHTB",
      "Sub Bidang Penagihan Restitusi PBB dan BPHTB"
    ]
  },
  {
    nama_bidang: "Pajak",
    subs: [
      "Sub Bidang Pendataan dan Pendaftaran Pajak",
      "Sub Bidang Perhitungan dan Penetapan Pajak Daerah",
      "Sub Bidang Konsultasi Keberatan dan Banding"
    ]
  },
  {
    nama_bidang: "Perencanaan dan Pengembangan Pendapatan Daerah",
    subs: [
      "Sub Bidang Regulasi Pendapatan Daerah",
      "Sub Bidang Restribusi dan Evaluasi Pendapatan Daerah",
      "Sub Bidang Pengembangan Sistem Informatika dan Inovasi Pendapatan Daerah"
    ]
  },
  {
    nama_bidang: "Pembukuan dan Pelaporan",
    subs: [
      "Sub Bidang Pembukuan dan Pelaporan",
      "Sub Bidang Pemeriksaan dan Verifikasi",
      "Sub Bidang Penagihan dan Restribusi Pajak Daerah"
    ]
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/e_arsip");
    console.log("Terhubung ke MongoDB...");

    // Hapus data lama agar counter mulai dari awal
    await Folder.deleteMany({});
    
    let counter = 1;

    // Fungsi untuk memformat angka menjadi string (misal: 1 -> "001")
    const formatKode = (num) => num.toString().padStart(3, '0');

    for (const item of dataMaster) {
      // 1. Simpan Parent
      const parentFolder = await Folder.create({
        name: item.nama_bidang,
        kode: formatKode(counter++),
        parent: null
      });

      console.log(`✅ Parent [${parentFolder.kode}]: ${parentFolder.name}`);

      // 2. Simpan Subs secara berurutan agar kode tidak tabrakan
      for (const subName of item.subs) {
        const subFolder = await Folder.create({
          name: subName,
          kode: formatKode(counter++),
          parent: parentFolder._id
        });
        console.log(`   --- Sub [${subFolder.kode}]: ${subFolder.name}`);
      }
    }

    console.log("\n🚀 Seeding selesai!");
    process.exit();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

seedDatabase();