import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import mongoose from "mongoose";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user || !user.is_active) {
    return res.status(401).json({ message: "Username / password salah" });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Username / password salah" });

  const token = jwt.sign(
    { sub: user._id, role: user.role, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user,
  });
});

//GET ACC
router.get("/me", authRequired, async (req, res) => {
  try {
    // req.user._id didapat dari middleware authRequired (decoded.sub)
    const user = await User.findById(req.user._id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json(user);
  } catch (error) {
    console.error("GET ME ERROR:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

// CREATE ACCOUNT
router.post("/createAcc", async (req, res) => {
  // Menambahkan no_hp ke destructuring body
  const { nama, nip, username, email, password, role, bidang, no_hp } = req.body;

  try {
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: "Username atau Email sudah digunakan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      nama,
      nip,
      username,
      email,
      password: hashedPassword,
      role,
      bidang,
      no_hp, // Simpan no hp di sini
    });

    res.status(201).json({
      message: "User berhasil didaftarkan",
      user: newUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

// FETCH ALL USERS
router.get("/fetchAcc", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select("-password");
    res.json({ message: "Data user berhasil diambil", users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

// FETCH ONLY ADMINS (API Baru)
router.get("/fetchAdmins", async (req, res) => {
  try {
    // Filter berdasarkan role "admin"
    const admins = await User.find({ role: "admin" })
      .sort({ nama: 1 })
      .select("-password");
      
    res.json({ 
      message: "Data admin berhasil diambil", 
      count: admins.length,
      admins 
    });
  } catch (error) {
    console.error("FETCH ADMINS ERROR:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

// EDIT USER (Updated to include no_hp)
router.put("/editAcc/:id", async (req, res) => {
  const userId = req.params.id;
  const { nama, nip, username, email, password, role, is_active, no_hp } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    user.nama = nama || user.nama;
    user.nip = nip || user.nip;
    user.username = username || user.username;
    user.email = email || user.email;
    user.role = role || user.role;
    user.no_hp = no_hp || user.no_hp; // Update no hp
    if (is_active !== undefined) user.is_active = is_active;

    await user.save();

    res.json({ message: "User berhasil diperbarui", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

// DELETE USER
router.delete("/deleteAcc/:id", async (req, res) => {
  const { id } = req.params;

  // cek valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID tidak valid" });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser)
      return res.status(404).json({ message: "User tidak ditemukan" });

    res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

export default router;
