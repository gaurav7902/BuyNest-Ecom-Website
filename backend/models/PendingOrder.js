import mongoose from "mongoose";

// Server-side record of what a customer is paying for. It is created together
// with the Razorpay order, so payment verification never has to trust the cart
// or the amount sent by the browser.
const pendingOrderSchema = new mongoose.Schema(
    {
        razorpayOrderId: {
            type: String,
            required: true,
            unique: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: [
            {
                _id: false,
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {type: Number, required: true, min: 1},
            },
        ],
        address: {
            fullName: {type: String, required: true},
            street: {type: String, required: true},
            city: {type: String, required: true},
            state: {type: String, required: true},
            postalCode: {type: String, required: true},
            country: {type: String, required: true},
        },
        // Amount in paise, computed on the server from database prices.
        amountPaise: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["created", "completed", "refunded"],
            default: "created",
        },
    },
    {timestamps: true},
);

// Drop abandoned checkouts after 7 days (long enough to reconcile late payments).
pendingOrderSchema.index(
    {createdAt: 1},
    {expireAfterSeconds: 7 * 24 * 60 * 60},
);

export default mongoose.model("PendingOrder", pendingOrderSchema);
