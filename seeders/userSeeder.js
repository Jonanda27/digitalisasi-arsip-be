import User from "../models/User.js";
import bcrypt from "bcrypt";

export async function seedUsers() {
  const hash = await bcrypt.hash("123456", 10);

  const users = [
    { nama: "Admin Sistem", nip: "1990000000000001", username: "admin", email: "admin@bapenda.go.id", password: hash, role: "admin" },
    { nama: "Kaban Bapenda", nip: "1988000000000001", username: "kaban", email: "kaban@bapenda.go.id", password: hash, role: "kaban" },
    { nama: "Pegawai Bapenda", nip: "1995000000000001", username: "pegawai", email: "pegawai@bapenda.go.id", password: hash, role: "pegawai" },
    { nama: "Scanner Vendor", nip: null, username: "scanner", email: "scanner@vendor.com", password: hash, role: "scanner" },
  ];

  for (const u of users) {
    const exist = await User.findOne({ username: u.username });
    if (!exist) await User.create(u);
  }

  console.log("✅ Users seeded");
}
