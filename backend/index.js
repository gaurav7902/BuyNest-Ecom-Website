import express from "express";
import cors from "cors";
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
const PORT = process.env.PORT || 5000;

//middlewares
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://127.0.0.1:5173",
            process.env.FRONTEND_URL,
        ],
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

    app.get("*", (req, res) => {
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

app.listen(PORT);
