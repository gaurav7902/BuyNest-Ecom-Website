import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Items are required to create a payment order",
            });
        }

        // calculating on the server to prevent price manipulation
        let totalAmount = 0;
        for (const item of items) {
            const product = await Product.findById(item._id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item._id}`,
                });
            }
            totalAmount += product.price * item.quantity;
        }

        const options = {
            amount: totalAmount * 100,  // razorpay expects amount in paise
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex"),
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            order,
            totalAmount,
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create order",
            error: error.message,
        });
    }
};

const processPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification details",
            });
        }

        // verify the payment signature
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generatedSignature === razorpay_signature) {
            // Find the order that was created with this Razorpay order ID and mark it as paid
            await Order.findOneAndUpdate(
                { paymentId: razorpay_order_id },
                { isPaid: true, status: "pending" } // Keep as pending until shipped
            );

            res.status(200).json({
                success: true,
                message: "Payment verified successfully",
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Invalid payment signature",
            });
        }
    } catch (error) {
        console.error("Error processing payment:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process payment",
            error: error.message,
        });
    }
};

export { createOrder, processPayment };
