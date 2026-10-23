# Mandi Fresh

An online grocery store for Lahore. Next.js (JSX) + Tailwind CSS on the frontend, Node.js + Express + MongoDB (Mongoose) on the backend.

## Features

- Landing page with full-screen video hero, categories, FAQs and more
- Shop with category filter and search
- Cart and checkout (cash on delivery)
- Register / login with JWT and hashed passwords
- Contact form that saves messages on the server

## Project structure

```
backend/    Express API (auth, products, orders, contact)
frontend/   Next.js app (app router, Tailwind)
```

## Getting started

You need Node.js 18 or newer and a MongoDB database (a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works). Run the backend and the frontend in two separate terminals.

### 1. Backend

```bash
cd backend
cp .env.example .env     # then set JWT_SECRET and MONGODB_URI
npm install
npm run dev              # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev              # http://localhost:3000
```

Open http://localhost:3000. Create an account from the Sign up page to place an order.

## Admin panel

Open `/admin` while logged in as an admin to manage products (add, edit, delete, mark out of stock), update order status and read customer messages.

Nobody can make themselves admin from the site. Register a normal account first, then promote it from the `backend` folder:

```bash
npm run make-admin -- you@example.com            # make admin
npm run make-admin -- you@example.com --remove   # back to a normal user
```

## API

| Method | Route | Who | Description |
| ------ | ----- | --- | ----------- |
| POST | `/api/auth/register` | public | Create an account |
| POST | `/api/auth/login` | public | Log in, returns a token |
| GET / PUT / DELETE | `/api/auth/me` | user | View, update (name, password) or delete your account |
| GET | `/api/products`, `/api/products/:id` | public | List (`category`, `search`) or view products |
| POST / PUT / DELETE | `/api/products`, `/api/products/:id` | admin | Add, edit or delete a product |
| POST / GET | `/api/orders` | user | Place an order / list your orders |
| PATCH | `/api/orders/:orderNumber/cancel` | user | Cancel your order while it is still "Placed" |
| GET | `/api/admin/orders` | admin | All orders with customer details |
| PATCH | `/api/admin/orders/:orderNumber` | admin | Change order status |
| POST | `/api/contact` | public | Send a contact message |
| GET / PATCH / DELETE | `/api/admin/messages`, `/api/admin/messages/:id` | admin | Read, mark read/unread, delete messages |

Users, products, orders and messages live in MongoDB. The starter catalogue in `backend/data/products.js` is copied into the database the first time the server connects to an empty one.

## Credits

Photos and the hero video are from [Unsplash](https://unsplash.com) and [Pexels](https://pexels.com).
