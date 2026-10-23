const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    topic: { type: String, default: "General" },
    message: { type: String, required: true, maxlength: 2000 },
    read: { type: Boolean, default: false },
    // Filled in when an admin answers from the panel
    reply: {
      subject: String,
      text: String,
      sentAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
