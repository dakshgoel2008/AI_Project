import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";

// Routes
import authRoutes from "./routes/auth.js";
import sahayakRoutes from "./routes/sahayak.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 4444;

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// const corsOrigins = JSON.parse(process.env.CORS_ORIGINS || '["*"]');
// app.use(
//     cors({
//         origin: corsOrigins,
//         credentials: true,
//     })
// );

// Test route
app.get("/", (req, res) => {
    res.send("Backend is running.");
});

app.use("/api/auth", authRoutes);
app.use("/api/sahayak", sahayakRoutes);

// Connect to DB and start server
mongoose
    .connect(process.env.DB_PATH)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Connected to DB & Server running at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Database connection failed:", err);
    });
