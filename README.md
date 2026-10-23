# Mandi Fresh

An online grocery store for Lahore. Next.js (JSX) + Tailwind CSS on the frontend, Node.js + Express on the backend.

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

You need Node.js 18 or newer. Run the backend and the frontend in two separate terminals.

### 1. Backend

```bash
cd backend
cp .env.example .env     # then set a real JWT_SECRET
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

## API

| Method | Route                | Auth | Description                      |
| ------ | -------------------- | ---- | -------------------------------- |
| POST   | `/api/auth/register` | no   | Create an account                |
| POST   | `/api/auth/login`    | no   | Log in, returns a token          |
| GET    | `/api/auth/me`       | yes  | Current user                     |
| GET    | `/api/products`      | no   | List products (`category`, `search`) |
| GET    | `/api/products/:id`  | no   | Single product                   |
| POST   | `/api/orders`        | yes  | Place an order                   |
| GET    | `/api/orders`        | yes  | Your orders                      |
| POST   | `/api/contact`       | no   | Send a contact message           |

Users, orders and messages are stored in `backend/data/db.json` (created automatically, not committed). Swap this for a real database such as MongoDB before going to production.

## Credits

Photos and the hero video are from [Unsplash](https://unsplash.com) and [Pexels](https://pexels.com).
