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

// Serverless deployments have no durable project filesystem. Keep the image in
// memory only while it is being streamed to Cloudinary by the controller.
const upload = multer({ storage: multer.memoryStorage() });
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
