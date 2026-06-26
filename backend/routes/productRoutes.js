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

const upload = multer({ dest: "public/uploads/" });
const routes = express.Router();

// delete files from local storage after upload
routes.use(
    (upload.single("image"),
    (req, res, next) => {
        if (req.file) {
            // Delete the uploaded file
            require("fs").unlinkSync(req.file.path);
        }
        next();
    })
);

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
