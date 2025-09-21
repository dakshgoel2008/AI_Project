import jwt from "jsonwebtoken";
import User from "../models/user.js";
import ErrorWrapper from "../utils/ErrorWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const verifyJWT = ErrorWrapper(async (req, res, next) => {
    const incomingAccessToken = req.cookies.accessToken;
    const incomingRefreshToken = req.cookies.refreshToken;
    if (!incomingAccessToken || !incomingRefreshToken) {
        throw new ErrorHandler(401, "Unauthorized user, Kindly login first, if new user please sign in first");
    }
    try {
        let decodedAccessToken = jwt.verify(incomingAccessToken, process.env.ACCESS_TOKEN_KEY);
        let user = await User.findOne({
            _id: decodedAccessToken.userId,
        });
        let userRefreshToken = user.refreshToken;
        if (userRefreshToken !== incomingRefreshToken) {
            throw new ErrorHandler(401, "Unauthorized user, Kindly login first, if new user please sign in first");
        }
        req.user = user; // To pull our the user anywhere.
        next(); // next request is handled
    } catch (err) {
        throw new ErrorHandler(500, "Internal Server Error");
    }
});
