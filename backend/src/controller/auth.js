import ErrorWrapper from "./../utils/ErrorWrapper.js";
import ErrorHandler from "./../utils/ErrorHandler.js";
import User from "../models/user.js";
import { Teacher, Student } from "../models/education.js";
import mongoose from "mongoose";

// Database connection checker
const isDBConnected = () => mongoose.connection.readyState === 1;

export const postSignUp = ErrorWrapper(async (req, res, next) => {
    // Check database connection first
    if (!isDBConnected()) {
        return res.status(503).json({
            success: false,
            message: "Database temporarily unavailable. User registration requires database connection.",
            error: "SERVICE_UNAVAILABLE",
            availableFeatures: ["AI content generation", "Image analysis"],
            unavailableFeatures: ["User registration", "Authentication", "Data persistence"]
        });
    }

    const { email, password, username, name, role } = req.body;
    const requiredFields = ["email", "password", "username", "name"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
        throw new ErrorHandler(400, `Missing required fields: ${missingFields.join(", ")}`);
    }

    // Validate role if provided
    const validRoles = ['student', 'teacher', 'admin'];
    if (role && !validRoles.includes(role)) {
        throw new ErrorHandler(400, `Invalid role. Must be one of: ${validRoles.join(", ")}`);
    }

    const existingUser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (existingUser) {
        throw new ErrorHandler(400, "User already exists with this email or username");
    }

    try {
        const user = new User({
            username,
            password,
            name,
            email,
            role: role || 'teacher' // Default to teacher if not specified
        });
        await user.save();

        // Create role-specific profile
        let roleProfile = null;
        if (user.role === 'teacher') {
            const teacher = new Teacher({
                userId: user._id,
                school: {
                    name: "Not specified",
                    location: "Not specified", 
                    type: "government"
                },
                classes: [],
                specialization: [],
                experience: 0,
                languages: ["English"]
            });
            await teacher.save();
            roleProfile = teacher;
        } else if (user.role === 'student') {
            const student = new Student({
                userId: user._id,
                name: user.name,
                grade: 1, // Default, can be updated later
                section: "A",
                rollNumber: Math.floor(Math.random() * 1000), // Temporary
                parentContact: {
                    name: "Not specified",
                    phone: "Not specified",
                    email: "Not specified"
                }
            });
            await student.save();
            roleProfile = student;
        }

        const userObject = user.toObject();
        delete userObject.password;
        
        res.status(201).json({
            message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} created successfully`,
            user: userObject,
            roleProfile: roleProfile,
            success: true,
        });
    } catch (err) {
        console.error("Error creating user:", err);
        throw new ErrorHandler(500, "Fail to create user", [err.message]);
    }
});

// generating access and refresh token for the authentication.
const generateAccessTokenAndRefreshToken = async (userId) => {
    // Check database connection
    if (!isDBConnected()) {
        throw new ErrorHandler(503, "Database connection required for token generation");
    }

    try {
        let user = await User.findOne({
            _id: userId,
        });
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        return {
            accessToken,
            refreshToken,
        };
    } catch (err) {
        throw new ErrorHandler(500, "Failed to generate access and refresh tokens", [err.message]);
    }
};

export const postLogin = ErrorWrapper(async (req, res, next) => {
    // Check database connection first
    if (!isDBConnected()) {
        return res.status(503).json({
            success: false,
            message: "Database temporarily unavailable. User login requires database connection.",
            error: "SERVICE_UNAVAILABLE",
            availableFeatures: ["AI content generation", "Image analysis"],
            unavailableFeatures: ["User login", "Authentication", "Data persistence"]
        });
    }

    const { email, password, username } = req.body;
    if (!password) {
        throw new ErrorHandler(400, "Password is required");
    }
    if (!username && !email) {
        throw new ErrorHandler(400, "Either username or email is required");
    }

    // find user on basis of email or username both are allowed.
    let user = await User.findOne({ $or: [{ email }, { username }] });

    // comparePassword: models.
    if (!user || !(await user.comparePassword(password))) {
        throw new ErrorHandler(401, "Invalid email or password");
    }

    // saving the refresh token in the database.
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    // want to remove the critical information from the user object.
    user = await User.findOne({
        $or: [{ email }, { username }],
    }).select("-password -refreshToken");

    // console.log(user);
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, // for XSS attacks
        secure: process.env.NODE_ENV === "development", // for production
        sameSite: "strict", // for CSRF attacks
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
        .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "development",
            sameSite: "strict",
            path: "/",
            maxAge: 15 * 60 * 1000, // 15 minutes
        })
        .status(200)
        .json({
            message: "Logged in successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                name: user.name,
            },
            success: true,
        });
});

export const postLogout = ErrorWrapper(async (req, res, next) => {
    // Check database connection first
    if (!isDBConnected()) {
        // For logout, we can still clear cookies even without DB
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "development",
            sameSite: "strict",
            path: "/",
        };
        
        return res
            .clearCookie("accessToken", cookieOptions)
            .clearCookie("refreshToken", cookieOptions)
            .status(200)
            .json({
                success: true,
                message: "Logged out successfully (database unavailable, cleared local session only)"
            });
    }

    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        throw new ErrorHandler(401, "No refresh token provided");
    }

    // Find user using refresh token
    const user = await User.findOne({ refreshToken });
    if (!user) {
        throw new ErrorHandler(401, "Invalid refresh token");
    }

    // Remove refresh token from the DB
    user.refreshToken = null;
    await user.save();

    // Clear cookies
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development",
        sameSite: "strict",
        path: "/",
    };

    res.clearCookie("refreshToken", cookieOptions);
    res.clearCookie("accessToken", cookieOptions);

    res.status(200).json({
        message: "Logged out successfully",
        success: true,
    });
});
