import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
import {
    registerUser,
    loginUser,
    verifyEmail,
    logoutUser,
    getUsers,
} from "../controllers/authController.js";
import verifiedEmail from "../middleware/verifiedEmail.js";

const routes = express.Router();

routes.post("/register", registerUser);
routes.post("/login", verifiedEmail, loginUser);
routes.post("/verify-email", verifyEmail);
routes.post("/logout", logoutUser);
routes.get("/users", protect, admin, getUsers);

export default routes;
