// Usage: npm run make-admin -- someone@example.com   (add "--remove" to make them a normal user again)
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
if (process.env.DNS_SERVERS) require("dns").setServers(process.env.DNS_SERVERS.split(","));
const mongoose = require("mongoose");
const User = require("../models/User");

const email = (process.argv[2] || "").toLowerCase();
const remove = process.argv.includes("--remove");

(async () => {
  if (!email || !process.env.MONGODB_URI) {
    console.error("Usage: npm run make-admin -- email@example.com   (MONGODB_URI must be set in .env)");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOneAndUpdate({ email }, { role: remove ? "user" : "admin" }, { new: true });
  if (!user) console.error(`No user with email ${email}. Register on the site first, then run this again.`);
  else console.log(`${user.email} is now ${user.role}.`);
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
