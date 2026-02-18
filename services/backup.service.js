import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pastikan path ke mongodump ini sesuai dengan di komputer Anda
const mongodumpPath = `"C:\\Program Files\\MongoDB\\mongodb-database-tools-windows-x86_64-100.14.1\\bin\\mongodump.exe"`;

const backupData = () => {
  // Format nama folder: backup-bulanan-2026-02
  const dateStr = new Date().toISOString().slice(0, 7);
  const folderName = `backup-bulanan-${dateStr}`;
  const rootBackupDir = path.join(__dirname, '../backups');
  const backupPath = path.join(rootBackupDir, folderName);

  if (!fs.existsSync(rootBackupDir)) {
    fs.mkdirSync(rootBackupDir, { recursive: true });
  }

  // Menghapus backup lama di bulan yang sama jika sudah ada
  if (fs.existsSync(backupPath)) {
    console.log(`🧹 [${new Date().toLocaleString()}] Membersihkan data lama bulan ini...`);
    fs.rmSync(backupPath, { recursive: true, force: true });
  }

  console.log(`⏳ [${new Date().toLocaleString()}] Memulai backup bulanan database 'e_arsip'...`);

  // windowsHide: true agar tidak muncul jendela CMD tiba-tiba
  exec(`${mongodumpPath} --db=e_arsip --out="${backupPath}"`, { windowsHide: true }, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Gagal melakukan backup bulanan:", err.message);
      return;
    }
    console.log(`✅ Sukses! Backup bulanan berhasil disimpan.`);
    console.log(`📂 Lokasi: ${backupPath}`);
  });
};

/**
 * JADWAL CRON: 0 7 1 * *
 * 0 : Menit 0
 * 7 : Jam 7 Pagi
 * 1 : Tanggal 1
 * * : Setiap Bulan
 * * : Setiap Hari dalam seminggu
 */
cron.schedule('0 7 1 * *', () => {
  backupData();
}, {
  scheduled: true,
  timezone: "Asia/Jakarta"
});

console.log("🚀 Service Backup Bulanan AKTIF.");
console.log("📅 Jadwal: Setiap Tanggal 1, Pukul 07:00 WIB.");