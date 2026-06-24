import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.get("/health", (req, res) => {
    res.send("Backend is working Properly");
});

app.use("/api/auth", authRoutes);

app.listen(PORT);
