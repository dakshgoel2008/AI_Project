import express from "express";
import { postSignUp, postLogin, postLogout } from "./../controller/auth.js";
import User from "../models/user.js";
import mongoose from "mongoose";

const router = express.Router();

// Database connection checker
const isDBConnected = () => mongoose.connection.readyState === 1;

// JWT:
router.post("/signup", postSignUp);
router.post("/login", postLogin);
router.post("/logout", postLogout);

router.get("/all", async (req, res, next) => {
    try {
        // Check database connection first
        if (!isDBConnected()) {
            return res.status(503).json({
                success: false,
                message: "Database temporarily unavailable. Cannot retrieve users.",
                error: "SERVICE_UNAVAILABLE",
                availableFeatures: ["AI content generation", "Image analysis"],
                unavailableFeatures: ["User management", "Authentication", "Data persistence"]
            });
        }

        const users = await User.find();
        res.status(200).json({
            success: true,
            users: users,
            count: users.length
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ 
            success: false,
            message: "Internal server error",
            error: err.message 
        });
    }
});

export default router;
