import express from "express";
const routes = express.Router();
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

import {
    registerUser,
    loginUser,
    logoutUser,
    getUsers,
} from "../controllers/authController.js";

routes.post("/register", registerUser);
routes.post("/login", loginUser);
routes.post("/logout", logoutUser);
routes.get("/users", protect, admin, getUsers);

export default routes;
