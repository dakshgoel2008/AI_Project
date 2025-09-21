import express from "express";
import { postSignUp, postLogin, postLogout } from "./../controller/auth.js";
import User from "../models/user.js";
const router = express.Router();

// JWT:
router.post("/signup", postSignUp);
router.post("/login", postLogin);
router.post("/logout", postLogout);

router.get("/all", async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
