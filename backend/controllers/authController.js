import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const verifyEmail = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res
                .status(400)
                .json({ message: "Email is already verified" });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        user.isVerified = true;
        user.otp = null; // Clear the OTP after successful verification
        await user.save();

        res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res
            .status(400)
            .json({ message: "Please provide name, email and password" });
    }

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        if (newUser) {
            const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
            newUser.otp = otp; // Store the OTP in the user document

            // mail
            const message = `
        Welcome to BuyNest Your account has been successfully created.
        Thank you for registering with us. We are excited to have you on board!
        Your OTP for email verification is: ${otp}`;
            await sendEmail(
                email,
                "Welcome to BuyNest, your OTP for registration",
                message
            ); // Send the welcome email with OTP

            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                token: generateToken(newUser._id),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

// login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res
            .status(400)
            .json({ message: "Please provide email and password" });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res
                .status(401)
                .json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res
                .status(401)
                .json({ message: "Invalid email or password" });
        }

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

// logout
const logoutUser = (req, res) => {
    res.status(200).json({ message: "User logged out successfully" });
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password");
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

export { registerUser, verifyEmail, loginUser, logoutUser, getUsers };
