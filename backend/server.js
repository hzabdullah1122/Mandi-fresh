require("dotenv").config();
// Some home/office networks refuse the DNS SRV lookup that mongodb+srv:// needs
// ("querySrv ECONNREFUSED"). Setting DNS_SERVERS=8.8.8.8,1.1.1.1 works around it.
if (process.env.DNS_SERVERS) require("dns").setServers(process.env.DNS_SERVERS.split(","));
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const products = require("./data/products");
const User = require("./models/User");
const Order = require("./models/Order");
const Message = require("./models/Message");

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
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });

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

// One shared connection promise. On Vercel the app runs as a serverless function, so the
// connection is opened on the first request that needs it and reused while the function is warm.
let dbConnection = null;
function connectDb() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI is missing");
  if (!dbConnection) {
    dbConnection = mongoose.connect(MONGODB_URI).catch((err) => {
      dbConnection = null; // let the next request try again
      throw err;
    });
  }
  return dbConnection;
}
app.use(["/api/auth", "/api/orders", "/api/contact"], wrap(async (_req, _res, next) => {
  await connectDb();
  next();
}));

// ---- Auth ----
app.post(
  "/api/auth/register",
  wrap(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
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

// ---- Products (static catalogue) ----
app.get("/api/products", (req, res) => {
  const { category, search } = req.query;
  let list = products;
  if (category && category !== "All") list = list.filter((p) => p.category === category);
  if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  res.json(list);
});

app.get("/api/products/:id", (req, res) => {
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

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

    // Prices always come from the catalogue, never from the client.
    let total = 0;
    const lines = [];
    for (const { id, qty } of items) {
      const p = products.find((x) => x.id === id);
      if (!p || !Number.isInteger(qty) || qty < 1)
        return res.status(400).json({ message: "Invalid cart item" });
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
