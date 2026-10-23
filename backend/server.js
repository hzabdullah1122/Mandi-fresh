require("dotenv").config();
// Some home/office networks refuse the DNS SRV lookup that mongodb+srv:// needs
// ("querySrv ECONNREFUSED"). Setting DNS_SERVERS=8.8.8.8,1.1.1.1 works around it.
if (process.env.DNS_SERVERS) require("dns").setServers(process.env.DNS_SERVERS.split(","));
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const seedProducts = require("./data/products");
const User = require("./models/User");
const Product = require("./models/Product");
const Order = require("./models/Order");
const Message = require("./models/Message");
const Image = require("./models/Image");
const { sendReply } = require("./lib/mailer");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const MONGODB_URI = process.env.MONGODB_URI;

// Allow CLIENT_URL (comma separated for several sites) plus any localhost / 127.0.0.1 port,
// so the frontend still works when Next.js moves to 3001 because 3000 is taken.
const allowedOrigins = (process.env.CLIENT_URL || "").split(",").map((s) => s.trim()).filter(Boolean);
const isLocal = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin) || isLocal(origin)),
  })
);
app.use(express.json());

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt });

const auth = (req, res, next) => {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Please log in first" });
  }
};

// Express 4 does not catch rejected promises from async handlers, so wrap them.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// The role is read from the database on every admin request, so removing someone's admin
// access takes effect immediately, even if they still hold a valid token.
const admin = [
  auth,
  wrap(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (user?.role !== "admin") return res.status(403).json({ message: "Admins only" });
    next();
  }),
];

// ---- Database connection ----
// One shared connection promise. On Vercel the app runs as a serverless function, so the
// connection is opened on the first request that needs it and reused while the function is warm.
let dbConnection = null;
function connectDb() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI is missing");
  if (!dbConnection) {
    dbConnection = mongoose
      .connect(MONGODB_URI)
      .then(async () => {
        // First run: copy the starter catalogue into the database so the shop is not empty.
        if ((await Product.estimatedDocumentCount()) === 0) await Product.insertMany(seedProducts);
      })
      .catch((err) => {
        dbConnection = null; // let the next request try again
        throw err;
      });
  }
  return dbConnection;
}
app.use(
  ["/api"],
  wrap(async (_req, _res, next) => {
    await connectDb();
    next();
  })
);

// ---- Auth ----
app.post(
  "/api/auth/register",
  wrap(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email || !password)
      return res.status(400).json({ message: "Name, email and password are required" });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    if (await User.exists({ email: email.toLowerCase() }))
      return res.status(409).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  })
);

app.post(
  "/api/auth/login",
  wrap(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user || !(await bcrypt.compare(password || "", user.password)))
      return res.status(401).json({ message: "Invalid email or password" });
    res.json({ token: signToken(user), user: publicUser(user) });
  })
);

app.get(
  "/api/auth/me",
  auth,
  wrap(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: publicUser(user) });
  })
);

// Update own profile (name, and password if both current and new password are sent)
app.put(
  "/api/auth/me",
  auth,
  wrap(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { name, currentPassword, newPassword } = req.body;

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ message: "Name cannot be empty" });
      user.name = name.trim();
    }
    if (newPassword) {
      if (newPassword.length < 6)
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      if (!(await bcrypt.compare(currentPassword || "", user.password)))
        return res.status(401).json({ message: "Current password is incorrect" });
      user.password = await bcrypt.hash(newPassword, 10);
    }
    await user.save();
    res.json({ user: publicUser(user) });
  })
);

// Delete own account (past orders stay on record for the shop)
app.delete(
  "/api/auth/me",
  auth,
  wrap(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!(await bcrypt.compare(req.body?.password || "", user.password)))
      return res.status(401).json({ message: "Password is incorrect" });
    await user.deleteOne();
    res.json({ message: "Account deleted" });
  })
);

// ---- Products ----
const publicProduct = (p) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  price: p.price,
  unit: p.unit,
  image: p.image,
  description: p.description,
  inStock: p.inStock,
});

// Uploaded photos live at /api/images/<id>. Delete the stored file once no product uses it.
async function dropImage(url) {
  const m = /^\/api\/images\/([a-f0-9]{24})$/.exec(url || "");
  if (m && !(await Product.exists({ image: url }))) await Image.findByIdAndDelete(m[1]);
}

function readProductBody(body) {
  const name = String(body.name || "").trim();
  const category = String(body.category || "").trim();
  const unit = String(body.unit || "").trim();
  const price = Number(body.price);
  if (!name || !category || !unit) return { error: "Name, category and unit are required" };
  if (!Number.isFinite(price) || price < 0) return { error: "Price must be a number, 0 or more" };
  const image = String(body.image || "").trim();
  if (!image) return { error: "Add a photo or an image link" };
  if (!/^(https?:\/\/|\/)/.test(image))
    return { error: "Image must be a web address (https://...) or a path starting with /" };
  return {
    data: {
      name,
      category,
      unit,
      price,
      image,
      description: String(body.description || "").trim(),
      inStock: body.inStock !== false,
    },
  };
}

app.get(
  "/api/products",
  wrap(async (req, res) => {
    const { category, search } = req.query;
    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (search) filter.name = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const list = await Product.find(filter).sort({ id: 1 });
    res.json(list.map(publicProduct));
  })
);

app.get(
  "/api/products/:id",
  wrap(async (req, res) => {
    const product = await Product.findOne({ id: Number(req.params.id) });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(publicProduct(product));
  })
);

app.post(
  "/api/products",
  admin,
  wrap(async (req, res) => {
    const { data, error } = readProductBody(req.body);
    if (error) return res.status(400).json({ message: error });
    const last = await Product.findOne().sort({ id: -1 });
    const product = await Product.create({ ...data, id: (last?.id || 0) + 1 });
    res.status(201).json(publicProduct(product));
  })
);

app.put(
  "/api/products/:id",
  admin,
  wrap(async (req, res) => {
    const { data, error } = readProductBody(req.body);
    if (error) return res.status(400).json({ message: error });
    const before = await Product.findOne({ id: Number(req.params.id) });
    if (!before) return res.status(404).json({ message: "Product not found" });
    const product = await Product.findOneAndUpdate({ id: Number(req.params.id) }, data, { new: true });
    if (before.image !== data.image) await dropImage(before.image);
    res.json(publicProduct(product));
  })
);

app.delete(
  "/api/products/:id",
  admin,
  wrap(async (req, res) => {
    const product = await Product.findOneAndDelete({ id: Number(req.params.id) });
    if (!product) return res.status(404).json({ message: "Product not found" });
    await dropImage(product.image);
    res.json({ message: "Product deleted" });
  })
);

// ---- Product photos ----
// The browser sends the resized photo as raw bytes (Content-Type: image/jpeg, png or webp).
const looksLikeImage = (b, type) =>
  (type === "image/jpeg" && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) ||
  (type === "image/png" && b.slice(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) ||
  (type === "image/webp" && b.slice(0, 4).toString() === "RIFF" && b.slice(8, 12).toString() === "WEBP");

app.post(
  "/api/admin/images",
  admin,
  express.raw({ type: ["image/jpeg", "image/png", "image/webp"], limit: "3mb" }),
  wrap(async (req, res) => {
    const type = (req.headers["content-type"] || "").split(";")[0];
    if (!Buffer.isBuffer(req.body) || req.body.length === 0 || !looksLikeImage(req.body, type))
      return res.status(400).json({ message: "Please upload a JPG, PNG or WebP photo" });
    const img = await Image.create({ contentType: type, data: req.body });
    res.status(201).json({ url: `/api/images/${img.id}` });
  })
);

app.get(
  "/api/images/:id",
  wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).end();
    const img = await Image.findById(req.params.id);
    if (!img) return res.status(404).end();
    res.set({ "Content-Type": img.contentType, "Cache-Control": "public, max-age=31536000, immutable" });
    res.send(img.data);
  })
);

// ---- Orders ----
const publicOrder = (o) => ({
  id: o.orderNumber,
  items: o.items,
  address: o.address,
  total: o.total,
  status: o.status,
  createdAt: o.createdAt,
});

app.post(
  "/api/orders",
  auth,
  wrap(async (req, res) => {
    const { items, address } = req.body;
    if (!Array.isArray(items) || items.length === 0 || !address?.trim())
      return res.status(400).json({ message: "Cart items and address are required" });
    if (items.some((i) => !Number.isInteger(i?.qty) || i.qty < 1))
      return res.status(400).json({ message: "Invalid cart item" });

    // Prices always come from the database, never from the client.
    const found = await Product.find({ id: { $in: items.map((i) => i.id) } });
    const byId = new Map(found.map((p) => [p.id, p]));
    let total = 0;
    const lines = [];
    for (const { id, qty } of items) {
      const p = byId.get(id);
      if (!p) return res.status(400).json({ message: "A product in your cart is no longer available" });
      if (!p.inStock) return res.status(400).json({ message: `${p.name} is out of stock` });
      total += p.price * qty;
      lines.push({ id: p.id, name: p.name, price: p.price, qty });
    }

    const order = await Order.create({
      orderNumber: "ORD-" + Date.now(),
      user: req.user.id,
      items: lines,
      address: address.trim(),
      total: Number(total.toFixed(2)),
    });
    res.status(201).json(publicOrder(order));
  })
);

app.get(
  "/api/orders",
  auth,
  wrap(async (req, res) => {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders.map(publicOrder));
  })
);

// Customers can cancel their own order until the shop starts packing it.
app.patch(
  "/api/orders/:orderNumber/cancel",
  auth,
  wrap(async (req, res) => {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber, user: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "Placed")
      return res.status(400).json({ message: `This order is already "${order.status}" and cannot be cancelled` });
    order.status = "Cancelled";
    await order.save();
    res.json(publicOrder(order));
  })
);

// ---- Admin: orders ----
app.get(
  "/api/admin/orders",
  admin,
  wrap(async (_req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 }).populate("user", "name email");
    res.json(
      orders.map((o) => ({
        ...publicOrder(o),
        customer: o.user ? { name: o.user.name, email: o.user.email } : { name: "Deleted user", email: "" },
      }))
    );
  })
);

app.patch(
  "/api/admin/orders/:orderNumber",
  admin,
  wrap(async (req, res) => {
    if (!Order.STATUSES.includes(req.body.status))
      return res.status(400).json({ message: "Invalid status" });
    const order = await Order.findOneAndUpdate(
      { orderNumber: req.params.orderNumber },
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(publicOrder(order));
  })
);

// ---- Contact form ----
app.post(
  "/api/contact",
  wrap(async (req, res) => {
    const { name, email, phone, topic, message } = req.body;
    if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email || "") || !message?.trim())
      return res.status(400).json({ message: "Please fill in your name, a valid email and a message" });
    if (message.length > 2000)
      return res.status(400).json({ message: "Message is too long (max 2000 characters)" });

    await Message.create({ name, email, phone, topic, message });
    res.status(201).json({ message: "Message received" });
  })
);

// ---- Admin: messages ----
const publicMessage = (m) => ({
  id: m.id,
  name: m.name,
  email: m.email,
  phone: m.phone,
  topic: m.topic,
  message: m.message,
  read: m.read,
  reply: m.reply?.text ? { subject: m.reply.subject, text: m.reply.text, sentAt: m.reply.sentAt } : null,
  createdAt: m.createdAt,
});

app.get(
  "/api/admin/messages",
  admin,
  wrap(async (_req, res) => {
    res.json((await Message.find().sort({ createdAt: -1 })).map(publicMessage));
  })
);

app.patch(
  "/api/admin/messages/:id",
  admin,
  wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Message not found" });
    const m = await Message.findByIdAndUpdate(req.params.id, { read: !!req.body.read }, { new: true });
    if (!m) return res.status(404).json({ message: "Message not found" });
    res.json(publicMessage(m));
  })
);

// Answer a customer by email, straight from the admin panel
app.post(
  "/api/admin/messages/:id/reply",
  admin,
  wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Message not found" });
    const m = await Message.findById(req.params.id);
    if (!m) return res.status(404).json({ message: "Message not found" });

    const text = String(req.body.text || "").trim();
    const subject = String(req.body.subject || "").trim() || `Re: ${m.topic}`;
    if (!text) return res.status(400).json({ message: "Write a reply first" });
    if (text.length > 5000) return res.status(400).json({ message: "Reply is too long (max 5000 characters)" });

    try {
      await sendReply({ to: m.email, subject, text, quote: m.message });
    } catch (err) {
      console.error("Mail error:", err.message);
      if (err.status === 503) return res.status(503).json({ message: err.message });
      return res.status(502).json({ message: "The email could not be sent. Please try again in a moment." });
    }

    m.reply = { subject, text, sentAt: new Date() };
    m.read = true;
    await m.save();
    res.json(publicMessage(m));
  })
);

app.delete(
  "/api/admin/messages/:id",
  admin,
  wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Message not found" });
    const m = await Message.findByIdAndDelete(req.params.id);
    if (!m) return res.status(404).json({ message: "Message not found" });
    res.json({ message: "Message deleted" });
  })
);

app.get("/", (_req, res) => res.json({ message: "Grocery API running" }));

// ---- Errors ----
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server" });
});

// ---- Start ----
// `node server.js` starts a normal server. When Vercel imports this file it just uses the exported app.
if (require.main === module) {
  connectDb()
    .then(() => {
      console.log("MongoDB connected");
      app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
    })
    .catch((err) => {
      console.error("Could not start the server:", err.message);
      process.exit(1);
    });
}

module.exports = app;
