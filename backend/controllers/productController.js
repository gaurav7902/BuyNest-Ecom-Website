import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";

const uploadImage = (file) =>
    new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "image" },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            }
        );

        uploadStream.end(file.buffer);
    });

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        let imageUrl = null;
        let cloudinaryId = null;

        if (req.file) {
            const result = await uploadImage(req.file);
            imageUrl = result.secure_url;
            cloudinaryId = result.public_id;
        }

        const product = new Product({
            name,
            description,
            price,
            category,
            stock,
            isActive: stock > 0,
            imageUrl,
            cloudinaryId,
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (req.file) {
            // upload new image
            const result = await uploadImage(req.file);
            const newImageUrl = result.secure_url;
            const newCloudinaryId = result.public_id;

            // delete old image from Cloudinary if it exists
            if (product.cloudinaryId) {
                await cloudinary.uploader.destroy(product.cloudinaryId);
            }

            product.imageUrl = newImageUrl;
            product.cloudinaryId = newCloudinaryId;
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.category = category || product.category;
        product.stock = stock !== undefined ? stock : product.stock;
        product.isActive = product.stock > 0;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // delete from cloudinary if image exists
        if (product.cloudinaryId) {
            await cloudinary.uploader.destroy(product.cloudinaryId);
        }

        await product.deleteOne();
        res.json({ message: "Product removed" });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

export {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
