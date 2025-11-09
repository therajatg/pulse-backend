import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import videoRoutes from "./routes/videos";
import { FRONTEND_URL } from "./constants";

dotenv.config();

export const app: Application = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  FRONTEND_URL || "",
].filter(Boolean);

// Middleware
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Video Upload API", status: "running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "OK", message: "Server is running" });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});
