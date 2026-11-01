const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("-passwordHash");

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Akun tidak aktif atau tidak ditemukan" });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Token tidak valid atau sudah kedaluwarsa" });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Akses khusus admin" });
  }

  next();
}

module.exports = { requireAuth, requireAdmin };