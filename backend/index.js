import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

dotenv.config();
connectDB();

const app = express();
const PORT = Number(process.env.PORT);

if (!process.env.VERCEL && (!Number.isInteger(PORT) || PORT <= 0)) {
    throw new Error("PORT must be set to a valid port number in backend/.env");
}

//middlewares
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "https://checkout.razorpay.com"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
                frameSrc: ["https://checkout.razorpay.com"],
            },
        },
    })
);
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
});
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
});

app.use("/api/health", apiLimiter);
app.use("/api/auth", authLimiter);

//routes
app.get("/health", (req, res) => {
    res.send("Backend is working Properly");
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

// Serve static files from the frontend build directory
if (process.env.NODE_ENV === "production") {
    const distPath = path.resolve(process.cwd(), "..", "frontend", "dist");
    app.use(express.static(distPath));

    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
}

// 404
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// global error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        message: "Internal Server Error",
        error: err.message,
    });
});

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}

export default app;
