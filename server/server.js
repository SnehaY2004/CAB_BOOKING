import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import cabsRoutes from "./routes/cabs.js";
import bookingsRoutes from "./routes/bookings.js";
import locationsRoutes from "./routes/locations.js";

const app = express();
const PORT = process.env.PORT || 8080;

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error("Missing MONGODB_URI or JWT_SECRET in .env");
  process.exit(1);
}

connectDB();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/cabs", cabsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/locations", locationsRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
