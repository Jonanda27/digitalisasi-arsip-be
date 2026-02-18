// middleware/role.js

// Fungsi reusable untuk memeriksa role tertentu
export const requireRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      message: "Forbidden: Anda tidak memiliki akses",
    });
  }
  next();
};

// Khusus admin (bisa tetap dipakai)
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Akses khusus admin",
    });
  }
  next();
};
