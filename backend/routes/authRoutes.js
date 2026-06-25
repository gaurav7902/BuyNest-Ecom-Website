import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    getUsers,
} from "../controllers/authController.js";

const routes = express.Router();

routes.post("/register", registerUser);
routes.post("/login", loginUser);
routes.post("/logout", logoutUser);
routes.get("/users", protect, admin, getUsers);

export default routes;
