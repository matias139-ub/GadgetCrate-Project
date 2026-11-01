const express = require("express");
const { z } = require("zod");
const User = require("../models/User");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/", async (_req, res) => {
  const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
  res.json({ users });
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");

  if (!user) {
    return res.status(404).json({ message: "Pengguna tidak ditemukan" });
  }

  res.json({ user });
});

router.patch("/:id", async (req, res) => {
  const parsed = z.object({ isActive: z.boolean() }).safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "isActive harus bernilai true atau false" });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: parsed.data.isActive },
    { new: true, runValidators: true }
  ).select("-passwordHash");

  if (!user) {
    return res.status(404).json({ message: "Pengguna tidak ditemukan" });
  }

  res.json({ user });
});

router.delete("/:id", async (req, res) => {
  if (String(req.user._id) === req.params.id) {
    return res.status(400).json({ message: "Admin tidak dapat menghapus akunnya sendiri" });
  }

  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "Pengguna tidak ditemukan" });
  }

  res.json({ message: "Pengguna berhasil dihapus" });
});

module.exports = router;