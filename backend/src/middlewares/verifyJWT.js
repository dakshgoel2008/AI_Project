import jwt from "jsonwebtoken";
import User from "../models/user.js";
import ErrorWrapper from "../utils/ErrorWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import mongoose from "mongoose";

// Database connection checker
const isDBConnected = () => mongoose.connection.readyState === 1;

export const verifyJWT = ErrorWrapper(async (req, res, next) => {
    const incomingAccessToken = req.cookies.accessToken;
    const incomingRefreshToken = req.cookies.refreshToken;
    
    if (!incomingAccessToken || !incomingRefreshToken) {
        throw new ErrorHandler(401, "Unauthorized user, Kindly login first, if new user please sign in first");
    }

    // Check database connection first
    if (!isDBConnected()) {
        // For basic JWT verification without database
        try {
            // Use ACCESS_TOKEN_SECRET (consistent with other middleware)
            let decodedAccessToken = jwt.verify(incomingAccessToken, process.env.ACCESS_TOKEN_SECRET);
            
            req.user = {
                _id: decodedAccessToken.userId,
                id: decodedAccessToken.userId,
                email: decodedAccessToken.email,
                username: decodedAccessToken.username,
                _fromJWT: true,
                _dbUnavailable: true
            };
            
            console.warn("Database unavailable - using basic JWT verification");
            return next();
        } catch (err) {
            throw new ErrorHandler(401, "Invalid access token");
        }
    }

    try {
        // Use ACCESS_TOKEN_SECRET for consistency
        let decodedAccessToken = jwt.verify(incomingAccessToken, process.env.ACCESS_TOKEN_SECRET);
        let user = await User.findOne({
            _id: decodedAccessToken.userId,
        });
        
        if (!user) {
            throw new ErrorHandler(401, "User not found");
        }
        
        let userRefreshToken = user.refreshToken;
        if (userRefreshToken !== incomingRefreshToken) {
            throw new ErrorHandler(401, "Unauthorized user, Kindly login first, if new user please sign in first");
        }
        
        req.user = user; // To pull our the user anywhere.
        next(); // next request is handled
    } catch (err) {
        if (err instanceof ErrorHandler) {
            throw err;
        }
        throw new ErrorHandler(500, "Internal Server Error");
    }
});
