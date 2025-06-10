import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import "./config/passport.js";
import agentRoutes from "./routes/agentRoutes.js";
import flowRoutes from "./routes/flowRoutes.js";

const app = express();

const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = process.env.FRONTEND_ORIGIN
  ? process.env.FRONTEND_ORIGIN.split(',')
  : ["http://localhost:5173"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "TOPSECRETWORD",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/auth", authRoutes);
app.use("/agents", agentRoutes);
app.use("/flows", flowRoutes);

// Error handling middleware
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