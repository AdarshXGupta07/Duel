import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(cors({
  credentials: true,
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// health check
app.get("/health", (_, res) => {
  res.json({ status: "OK" });
});

// routes
app.use("/api/auth", authRoutes);

// Global error handler (must be after routes)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  // Ensure error response is always valid JSON
  const errorResponse = {
    success: false,
    statusCode: err.statusCode || 500,
    message: err.message || "Internal server error",
    data: null
  };
  
  res.status(err.statusCode || 500).json(errorResponse);
});

export default app;
