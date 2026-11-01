const express = require("express");
const { z } = require("zod");
const Product = require("../models/Product");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(5).max(2000),
  category: z.enum([
    "Casing HP",
    "Powerbank",
    "Mechanical Keyboard",
    "Headset",
    "Komponen Laptop"
  ]),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  imageUrl: z.string().url()
});

router.get("/", async (req, res) => {
  const filter = {};
  const { q, category } = req.query;

  if (q) {
    filter.name = { $regex: String(q), $options: "i" };
  }

  if (category) {
    filter.category = category;
  }

  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json({ products });
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Produk tidak ditemukan" });
  }

  res.json({ product });
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const parsed = productSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Data produk tidak valid",
      errors: parsed.error.flatten()
    });
  }

  const product = await Product.create(parsed.data);
  res.status(201).json({ product });
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const parsed = productSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Data produk tidak valid",
      errors: parsed.error.flatten()
    });
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    parsed.data,
    { new: true, runValidators: true }
  );

  if (!product) {
    return res.status(404).json({ message: "Produk tidak ditemukan" });
  }

  res.json({ product });
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Produk tidak ditemukan" });
  }

  res.json({ message: "Produk berhasil dihapus" });
});

module.exports = router;