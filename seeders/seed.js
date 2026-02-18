import "dotenv/config";            // agar process.env bisa terbaca
import { connectDB } from "../db.js"; // pastikan path sesuai
import { seedUsers } from "./userSeeder.js"; // path seeder

async function main() {
  try {
    await connectDB();           // ✅ koneksi ke MongoDB
    await seedUsers();           // ✅ jalankan seeding
    console.log("Semua user berhasil di-seed");
    process.exit(0);             // keluar proses setelah selesai
  } catch (error) {
    console.error("Seeding gagal:", error);
    process.exit(1);
  }
}

main();
