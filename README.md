# CabBook – Cab Booking Website

A full-stack cab booking app with **MongoDB**, **Node/Express**, and **Reactjs**.

## What you need

- **Node.js** (v18+)
- **MongoDB** running locally or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

## Setup

### 1. Backend (server)

```bash
cd server
npm install
```

Create a `.env` file (copy from `.env.example` and edit):

```bash
cp .env.example .env
```

Edit `server/.env` and set:

| Variable       | Description |
|----------------|-------------|
| `PORT`         | Server port (default `5000`) |
| `MONGODB_URI`  | MongoDB URL, e.g. `mongodb://localhost:27017/cabbooking` or your Atlas URI |
| `JWT_SECRET`   | Any long random string (used for login tokens) |
| `FRONTEND_URL` | React app URL, e.g. `http://localhost:5173` |

Seed sample cabs (optional):

```bash
npm run seed
```

Start the server:

```bash
npm run dev
```

### 2. Frontend (client)

```bash
cd client
npm install
```

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `client/.env` and set:

| Variable         | Description |
|------------------|-------------|
| `VITE_API_URL`   | Backend URL, e.g. `http://localhost:5000` (must match where the server runs) |

Start the React app:

```bash
npm run dev
```

Open **http://localhost:5173** in the browser.

## Running on your machine

1. Install and start **MongoDB** (local or use Atlas).
2. In **server**: copy `.env.example` → `.env`, set `MONGODB_URI`, `JWT_SECRET`, and optionally `PORT` and `FRONTEND_URL`.
3. In **client**: copy `.env.example` → `.env`, set `VITE_API_URL` to your backend URL (e.g. `http://localhost:5000`).
4. Run `npm run dev` in **server** and `npm run dev` in **client** (from `server` and `client` folders).

## Features

- User sign up / login (JWT)
- List cab types (Mini, Sedan, SUV, Luxury)
- Book a cab: pickup, drop, distance, date/time, cab choice
- View and cancel bookings
- Fare calculated from distance × cab price per km

## Project structure

```
cab/
├── server/           # Express API
│   ├── config/       # DB connection
│   ├── models/       # User, Cab, Booking
│   ├── routes/       # auth, cabs, bookings
│   ├── middleware/   # JWT auth
│   └── scripts/      # seed cabs
├── client/           # React (Vite)
│   └── src/
│       ├── context/  # Auth
│       ├── pages/    # Home, Login, Register, Book, My Bookings
│       └── components/
└── README.md
```
