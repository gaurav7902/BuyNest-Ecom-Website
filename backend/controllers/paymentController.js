import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import PendingOrder from "../models/PendingOrder.js";

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

// `refund: true` marks failures that happen AFTER the customer has paid, so the
// caller knows the money must be returned.
const createError = (message, status, refund = false) =>
    Object.assign(new Error(message), {status, refund});

const validateAddress = (address) => {
    if (!address || typeof address !== "object") {
        throw createError("Shipping address is required", 400);
    }

    const clean = {};
    for (const field of addressFields) {
        if (typeof address[field] !== "string" || !address[field].trim()) {
            throw createError(
                `Shipping address field '${field}' is required`,
                400,
            );
        }
        clean[field] = address[field].trim();
    }
    return clean;
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
                400,
            );
        }
        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
            throw createError(
                "Each item must have a positive whole-number quantity",
                400,
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

// Prices come from the database only. Totals are summed in integer paise to
// avoid floating-point mismatches with the amount Razorpay stores.
const prepareItems = async (items, session) => {
    let totalPaise = 0;
    const preparedItems = [];

    for (const item of items) {
        const product = await Product.findOne({
            _id: item.product,
            isActive: true,
        }).session(session ?? null);

        if (!product) {
            throw createError(`Product is unavailable: ${item.product}`, 404);
        }
        if (product.stock < item.quantity) {
            throw createError(`Insufficient stock for ${product.name}`, 400);
        }

        totalPaise += Math.round(product.price * 100) * item.quantity;
        preparedItems.push({
            product: product._id,
            quantity: item.quantity,
            name: product.name,
            image: product.imageUrl,
            price: product.price,
        });
    }

    return {totalPaise, preparedItems};
};

const refundPayment = async (paymentId, reason) => {
    try {
        await razorpay.payments.refund(paymentId, {
            speed: "normal",
            notes: {reason},
        });
        return true;
    } catch (refundError) {
        // Do not hide this: a failed refund needs manual follow-up.
        console.error(
            `REFUND FAILED for payment ${paymentId}. Refund manually.`,
            refundError,
        );
        return false;
    }
};

// Step 1: price the cart on the server, create the Razorpay order and remember
// exactly what was priced.
const createOrder = async (req, res) => {
    try {
        const items = normalizeItems(req.body.items);
        const address = validateAddress(req.body.address);
        const {totalPaise} = await prepareItems(items);

        const order = await razorpay.orders.create({
            amount: totalPaise,
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex"),
            notes: {userId: req.user._id.toString()},
        });

        await PendingOrder.create({
            razorpayOrderId: order.id,
            user: req.user._id,
            items,
            address,
            amountPaise: totalPaise,
        });

        return res.status(200).json({
            success: true,
            order,
            totalAmount: totalPaise / 100,
        });
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

// Step 2: verify the payment against what was stored in step 1. The request
// body is only trusted for the three Razorpay identifiers, never for the cart,
// address or amount.
const processPayment = async (req, res) => {
    let paymentId = null;
    try {
        const {razorpay_order_id, razorpay_payment_id, razorpay_signature} =
            req.body;
        if (
            typeof razorpay_order_id !== "string" ||
            typeof razorpay_payment_id !== "string" ||
            typeof razorpay_signature !== "string"
        ) {
            throw createError("Payment verification details are required", 400);
        }

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (
            razorpay_signature.length !== generatedSignature.length ||
            !crypto.timingSafeEqual(
                Buffer.from(razorpay_signature),
                Buffer.from(generatedSignature),
            )
        ) {
            throw createError("Invalid payment signature", 400);
        }
        paymentId = razorpay_payment_id;

        const pending = await PendingOrder.findOne({
            razorpayOrderId: razorpay_order_id,
        });
        if (!pending) {
            throw createError("Unknown payment order", 404);
        }
        if (pending.user.toString() !== req.user._id.toString()) {
            throw createError("Payment does not belong to this user", 403);
        }

        // Idempotency: a retry or double-click returns the existing order.
        const existingOrder = await Order.findOne({
            paymentId: razorpay_order_id,
        });
        if (existingOrder) {
            return res.status(200).json({success: true, order: existingOrder});
        }
        if (pending.status === "refunded") {
            throw createError("This payment was refunded", 409);
        }

        // Ask Razorpay what was really paid, and compare it with what the
        // server priced when the order was created.
        const rzpOrder = await razorpay.orders.fetch(razorpay_order_id);
        if (
            rzpOrder.status !== "paid" ||
            rzpOrder.amount_paid !== pending.amountPaise ||
            rzpOrder.amount !== pending.amountPaise
        ) {
            throw createError("Paid amount does not match the order", 400);
        }

        // From here on the customer has paid: any failure must trigger a refund.
        const session = await Product.startSession();
        let order;
        try {
            await session.withTransaction(async () => {
                let prepared;
                try {
                    prepared = await prepareItems(pending.items, session);
                } catch (err) {
                    throw createError(err.message, 409, true);
                }

                // Prices may have changed between checkout and payment.
                if (prepared.totalPaise !== pending.amountPaise) {
                    throw createError(
                        "Prices changed during checkout",
                        409,
                        true,
                    );
                }

                for (const item of pending.items) {
                    const product = await Product.findOneAndUpdate(
                        {
                            _id: item.product,
                            isActive: true,
                            stock: {$gte: item.quantity},
                        },
                        {$inc: {stock: -item.quantity}},
                        {new: true, session},
                    );

                    if (!product) {
                        throw createError(
                            "Product stock changed during checkout",
                            409,
                            true,
                        );
                    }
                }

                [order] = await Order.create(
                    [
                        {
                            user: req.user._id,
                            items: prepared.preparedItems,
                            totalAmount: prepared.totalPaise / 100,
                            address: pending.address,
                            paymentId: razorpay_order_id,
                            isPaid: true,
                            status: "pending",
                        },
                    ],
                    {session},
                );

                pending.status = "completed";
                await pending.save({session});
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
        // Two simultaneous verify calls: the unique paymentId index lets only
        // one create the order, the other returns it.
        if (error.code === 11000 && req.body?.razorpay_order_id) {
            const existing = await Order.findOne({
                paymentId: req.body.razorpay_order_id,
            });
            if (
                existing &&
                existing.user.toString() === req.user._id.toString()
            ) {
                return res.status(200).json({success: true, order: existing});
            }
        }

        if (error.refund && paymentId) {
            const refunded = await refundPayment(paymentId, error.message);
            if (refunded) {
                await PendingOrder.updateOne(
                    {razorpayOrderId: req.body.razorpay_order_id},
                    {status: "refunded"},
                );
            }
            return res.status(409).json({
                success: false,
                refunded,
                message: refunded
                    ? `${error.message}. Your payment has been refunded.`
                    : `${error.message}. We could not refund automatically; support will contact you.`,
            });
        }

        console.error("Error processing payment:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.status ? error.message : "Failed to process payment",
        });
    }
};

export {createOrder, processPayment};
