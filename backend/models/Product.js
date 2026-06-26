import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String,
            required: false,
        },
        cloudinaryId: {
            type: String,
            required: false,
        },
        stock: {
            type: Number,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        rating: {
            type: Number,
            default: 0,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Product", productSchema);
