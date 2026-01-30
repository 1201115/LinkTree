import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import linksRoutes from "./routes/links.js";
import placesRoutes from "./routes/places.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false
});

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/auth", authLimiter, authRoutes);
app.use("/", profileRoutes);
app.use("/", linksRoutes);
app.use("/", placesRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
