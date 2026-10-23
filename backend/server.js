require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const products = require("./data/products");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// Allow CLIENT_URL plus any localhost / 127.0.0.1 port, so the frontend still works
// when Next.js moves to 3001 because 3000 is taken.
const allowedOrigins = [process.env.CLIENT_URL].filter(Boolean);
const isLocal = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin) || isLocal(origin)),
  })
);
app.use(express.json());

// ---- Tiny JSON-file "database" (swap for MongoDB later) ----
const DB_FILE = path.join(__dirname, "data", "db.json");
const loadDb = () => {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch {
    return { users: [], orders: [] };
  }
};
const saveDb = (db) => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
const publicUser = ({ id, name, email }) => ({ id, name, email });

const auth = (req, res, next) => {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Please log in first" });
  }
};

// ---- Auth ----
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "Name, email and password are required" });
  if (password.length < 6)
    return res.status(400).json({ message: "Password must be at least 6 characters" });

  const db = loadDb();
  if (db.users.some((u) => u.email === email.toLowerCase()))
    return res.status(409).json({ message: "Email already registered" });

  const user = {
    id: Date.now(),
    name,
    email: email.toLowerCase(),
    password: await bcrypt.hash(password, 10),
  };
  db.users.push(user);
  saveDb(db);
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = loadDb().users.find((u) => u.email === (email || "").toLowerCase());
  if (!user || !(await bcrypt.compare(password || "", user.password)))
    return res.status(401).json({ message: "Invalid email or password" });
  res.json({ token: signToken(user), user: publicUser(user) });
});

app.get("/api/auth/me", auth, (req, res) => {
  const user = loadDb().users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user: publicUser(user) });
});

// ---- Products ----
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
app.post("/api/orders", auth, (req, res) => {
  const { items, address } = req.body;
  if (!Array.isArray(items) || items.length === 0 || !address)
    return res.status(400).json({ message: "Cart items and address are required" });

  let total = 0;
  const lines = [];
  for (const { id, qty } of items) {
    const p = products.find((x) => x.id === id);
    if (!p || !(qty > 0)) return res.status(400).json({ message: "Invalid cart item" });
    total += p.price * qty;
    lines.push({ id: p.id, name: p.name, price: p.price, qty });
  }

  const db = loadDb();
  const order = {
    id: "ORD-" + Date.now(),
    userId: req.user.id,
    items: lines,
    address,
    total: Number(total.toFixed(2)),
    status: "Placed",
    createdAt: new Date().toISOString(),
  };
  db.orders.push(order);
  saveDb(db);
  res.status(201).json(order);
});

app.get("/api/orders", auth, (req, res) => {
  res.json(loadDb().orders.filter((o) => o.userId === req.user.id).reverse());
});

// ---- Contact form ----
app.post("/api/contact", (req, res) => {
  const { name, email, phone, topic, message } = req.body;
  if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email || "") || !message?.trim())
    return res.status(400).json({ message: "Please fill in your name, a valid email and a message" });
  if (message.length > 2000)
    return res.status(400).json({ message: "Message is too long (max 2000 characters)" });

  const db = loadDb();
  db.messages = db.messages || [];
  db.messages.push({
    id: "MSG-" + Date.now(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: (phone || "").trim(),
    topic: topic || "General",
    message: message.trim(),
    createdAt: new Date().toISOString(),
  });
  saveDb(db);
  res.status(201).json({ message: "Message received" });
});

app.get("/", (_req, res) => res.json({ message: "Grocery API running" }));

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
