import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/productController.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });
const routes = express.Router();

routes
    .route("/")
    .get(getProducts)
    .post(protect, admin, upload.single("image"), createProduct);

routes
    .route("/:id")
    .get(getProductById)
    .put(protect, admin, upload.single("image"), updateProduct)
    .delete(protect, admin, deleteProduct);

export default routes;
