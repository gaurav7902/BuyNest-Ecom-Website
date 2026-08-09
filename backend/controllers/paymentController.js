import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const addressFields = [
    "fullName",
    "street",
    "city",
    "state",
    "postalCode",
    "country",
];

const createError = (message, status) =>
    Object.assign(new Error(message), { status });

const validateAddress = (address) => {
    if (!address || typeof address !== "object") {
        throw createError("Shipping address is required", 400);
    }

    for (const field of addressFields) {
        if (typeof address[field] !== "string" || !address[field].trim()) {
            throw createError(
                `Shipping address field '${field}' is required`,
                400
            );
        }
    }
};

const normalizeItems = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw createError("At least one cart item is required", 400);
    }

    const combinedItems = new Map();
    for (const item of items) {
        const productId = item?._id || item?.product;
        if (!mongoose.isValidObjectId(productId)) {
            throw createError(
                "Each cart item must reference a valid product",
                400
            );
        }
        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
            throw createError(
                "Each item must have a positive whole-number quantity",
                400
            );
        }

        const id = productId.toString();
        combinedItems.set(id, (combinedItems.get(id) || 0) + item.quantity);
    }

    return [...combinedItems].map(([product, quantity]) => ({
        product,
        quantity,
    }));
};

const prepareItems = async (items, session) => {
    let totalAmount = 0;
    const preparedItems = [];

    for (const item of items) {
        const product = await Product.findOne({
            _id: item.product,
            isActive: true,
        }).session(session);

        if (!product) {
            throw createError(`Product is unavailable: ${item.product}`, 404);
        }
        if (product.stock < item.quantity) {
            throw createError(`Insufficient stock for ${product.name}`, 400);
        }

        totalAmount += product.price * item.quantity;
        preparedItems.push({
            product: product._id,
            quantity: item.quantity,
            name: product.name,
            image: product.imageUrl,
            price: product.price,
        });
    }

    return { totalAmount, preparedItems };
};

const createOrder = async (req, res) => {
    try {
        const items = normalizeItems(req.body.items);
        const { totalAmount } = await prepareItems(items);
        const order = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex"),
        });

        return res.status(200).json({ success: true, order, totalAmount });
    } catch (error) {
        console.error("Error creating order:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.status
                ? error.message
                : "Failed to create payment order",
        });
    }
};

const processPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            throw createError("Payment verification details are required", 400);
        }

        validateAddress(req.body.address);
        const items = normalizeItems(req.body.items);
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (
            razorpay_signature.length !== generatedSignature.length ||
            !crypto.timingSafeEqual(
                Buffer.from(razorpay_signature),
                Buffer.from(generatedSignature)
            )
        ) {
            throw createError("Invalid payment signature", 400);
        }

        const existingOrder = await Order.findOne({
            paymentId: razorpay_order_id,
        });
        if (existingOrder) {
            if (existingOrder.user.toString() !== req.user._id.toString()) {
                throw createError("Payment does not belong to this user", 403);
            }
            return res
                .status(200)
                .json({ success: true, order: existingOrder });
        }

        const session = await Product.startSession();
        let order;
        try {
            await session.withTransaction(async () => {
                const { totalAmount, preparedItems } = await prepareItems(
                    items,
                    session
                );

                for (const item of items) {
                    const product = await Product.findOneAndUpdate(
                        {
                            _id: item.product,
                            isActive: true,
                            stock: { $gte: item.quantity },
                        },
                        { $inc: { stock: -item.quantity } },
                        { new: true, session }
                    );

                    if (!product) {
                        throw createError(
                            "Product stock changed during checkout. Please contact support for a refund.",
                            409
                        );
                    }
                }

                [order] = await Order.create(
                    [
                        {
                            user: req.user._id,
                            items: preparedItems,
                            totalAmount,
                            address: req.body.address,
                            paymentId: razorpay_order_id,
                            isPaid: true,
                            status: "pending",
                        },
                    ],
                    { session }
                );
            });
        } finally {
            await session.endSession();
        }

        return res.status(201).json({
            success: true,
            message: "Payment verified successfully",
            order,
        });
    } catch (error) {
        console.error("Error processing payment:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.status ? error.message : "Failed to process payment",
        });
    }
};

export { createOrder, processPayment };
