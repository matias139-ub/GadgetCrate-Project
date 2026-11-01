require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Product = require("./models/Product");

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  const email = (process.env.ADMIN_EMAIL || "admin@gadgetcrate.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!password || password.length < 12) {
    throw new Error("Atur ADMIN_PASSWORD minimal 12 karakter di .env");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await User.findOneAndUpdate(
    { email },
    {
      name: process.env.ADMIN_NAME || "GadgetCrate Admin",
      email,
      passwordHash,
      role: "admin",
      isActive: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const examples = [
    {
      name: "Casing Clear Armor",
      description: "Casing transparan dengan perlindungan sudut untuk penggunaan sehari-hari.",
      category: "Casing HP",
      price: 89000,
      stock: 25,
      imageUrl: "https://placehold.co/600x400?text=Casing"
    },
    {
      name: "Powerbank 10000 mAh",
      description: "Powerbank ringkas dengan dua port pengisian.",
      category: "Powerbank",
      price: 249000,
      stock: 15,
      imageUrl: "https://placehold.co/600x400?text=Powerbank"
    },
    {
      name: "Mechanical Keyboard 75%",
      description: "Keyboard mekanis ringkas untuk mengetik dan bekerja.",
      category: "Mechanical Keyboard",
      price: 599000,
      stock: 8,
      imageUrl: "https://placehold.co/600x400?text=Keyboard"
    }
  ];

  for (const item of examples) {
    await Product.updateOne(
      { name: item.name },
      { $set: item },
      { upsert: true }
    );
  }

  console.log("Admin dan produk contoh berhasil dibuat");
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});