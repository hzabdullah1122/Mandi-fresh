const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // Numeric id kept on purpose: carts, orders and the frontend already use it.
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    description: { type: String, default: "", trim: true },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
