import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import "./config/passport.js";
import agentRoutes from "./routes/agentRoutes.js";
import flowRoutes from "./routes/flowRoutes.js";

const app = express();

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) app.set('trust proxy', 1);

const allowedOrigins = isProduction
  ? [process.env.FRONTEND_ORIGIN]
  : ["http://localhost:5173"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use(passport.initialize());
// No express-session, no passport.session()

app.use("/auth", authRoutes);
app.use("/agents", agentRoutes);
app.use("/flows", flowRoutes);

app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ error: "Internal server error" });
});

mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});