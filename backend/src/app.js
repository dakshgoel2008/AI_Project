import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Routes
import authRoutes from "./routes/auth.js";
import sahayakRoutes from "./routes/sahayak.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 4444;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: "Too many requests from this IP, please try again later."
    }
});
app.use(limiter);

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const corsOrigins = JSON.parse(process.env.CORS_ORIGINS || '["http://localhost:3000"]');
app.use(
    cors({
        origin: corsOrigins,
        credentials: true,
    })
);

// Test route
app.get("/", (req, res) => {
    res.send("Backend is running.");
});

app.use("/api/auth", authRoutes);
app.use("/api/sahayak", sahayakRoutes);

// Connect to DB and start server
const startServer = () => {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
};

mongoose
    .connect(process.env.DB_PATH)
    .then(() => {
        console.log("Connected to MongoDB Atlas");
        startServer();
    })
    .catch((err) => {
        console.error("Database connection failed:", err.message);
        console.log("Starting server without database connection...");
        startServer();
    });
