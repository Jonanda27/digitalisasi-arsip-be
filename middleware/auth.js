import jwt from "jsonwebtoken";

export function authRequired(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 FIX UTAMA DI SINI
    req.user = {
      _id: decoded.sub || decoded._id || decoded.id,       // ⬅️ AMBIL DARI JWT
      role: decoded.role,
      username: decoded.username,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
