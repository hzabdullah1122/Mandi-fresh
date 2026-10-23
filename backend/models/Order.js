const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [
      {
        _id: false,
        id: Number,
        name: String,
        price: Number,
        qty: Number,
      },
    ],
    address: { type: String, required: true },
    total: { type: Number, required: true },
    status: { type: String, default: "Placed" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
