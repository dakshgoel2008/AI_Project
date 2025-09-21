import jwt from "jsonwebtoken";
import User from "../models/user.js";
import mongoose from "mongoose";

// Database connection checker
const isDBConnected = () => mongoose.connection.readyState === 1;

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access token is required",
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);

        // Get user from database (when DB is available)
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid token - user not found",
            });
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: "Invalid or expired token",
            error: error.message,
        });
    }
};

// Middleware for role-based access (teachers only)
export const requireTeacher = async (req, res, next) => {
    try {
        // First authenticate
        await authenticateToken(req, res, () => {});

        // Check if user has teacher profile
        const { Teacher } = await import("../models/education.js");
        const teacher = await Teacher.findOne({ userId: req.user.id });

        if (!teacher) {
            return res.status(403).json({
                success: false,
                message: "Teacher profile required to access this resource",
            });
        }

        req.teacher = teacher;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error checking teacher authorization",
            error: error.message,
        });
    }
};

// Middleware for admin access
export const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: "Admin access required",
        });
    }
};

export default { authenticateToken, requireTeacher, requireAdmin };
