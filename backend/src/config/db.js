const mongoose = require("mongoose");

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI belum diatur");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB terhubung");
}

module.exports = connectDB;