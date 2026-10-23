const mongoose = require("mongoose");

const STATUSES = ["Placed", "Packed", "Out for delivery", "Delivered", "Cancelled"];

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
    status: { type: String, enum: STATUSES, default: "Placed" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
module.exports.STATUSES = STATUSES;
