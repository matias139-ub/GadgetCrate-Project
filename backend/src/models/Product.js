const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Casing HP",
        "Powerbank",
        "Mechanical Keyboard",
        "Headset",
        "Komponen Laptop"
      ]
    },
    price: {
      type: Number,
      required: true,
      min: 1
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);