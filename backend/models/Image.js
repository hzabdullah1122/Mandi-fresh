const mongoose = require("mongoose");

// Uploaded product photos. Stored in the database because Vercel's file system is read-only.
const imageSchema = new mongoose.Schema(
  {
    contentType: { type: String, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Image", imageSchema);
