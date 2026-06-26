import Order from "../models/Order.js";
import sendEmail from "../utils/sendEmail.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

const createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { items, address, paymentId } = req.body;

        if (!items || items.length === 0 || !address || !paymentId) {
            return res.status(400).json({
                message:
                    "Missing required fields: items, address, or paymentId",
            });
        }

        let calculatedTotal = 0;
        const orderItemsSnapshot = [];

        // transaction for atomicity
        await session.withTransaction(async () => {
            for (const item of items) {
                const product = await Product.findById(item._id).session(
                    session
                );

                if (!product) {
                    throw {
                        status: 404,
                        message: `Product not found: ${item._id}`,
                    };
                }

                if (!product.isActive) {
                    throw {
                        status: 400,
                        message: `Product no longer available: ${product.name}`,
                    };
                }

                if (product.stock < item.quantity) {
                    throw {
                        status: 400,
                        message: `Insufficient stock for ${product.name}. Only ${product.stock} available.`,
                    };
                }

                const itemTotal = product.price * item.quantity;
                calculatedTotal += itemTotal;

                orderItemsSnapshot.push({
                    product: product._id,
                    name: product.name,
                    image: product.imageUrl,
                    quantity: item.quantity,
                    price: product.price,
                });

                // Deduct stock
                await Product.findByIdAndUpdate(
                    product._id,
                    { $inc: { stock: -item.quantity } },
                    { session }
                );
            }

            const newOrder = new Order({
                user: req.user._id,
                items: orderItemsSnapshot,
                totalAmount: calculatedTotal,
                address,
                paymentId,
            });

            await newOrder.save({ session });

            session.result = newOrder;
        });

        const order = session.result;

        const emailSubject = "Order Confirmation";
        const emailBody = `<h1>Thank you for your order!</h1>
        <p>Your order has been successfully placed.</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Total Amount:</strong> $${order.totalAmount}</p>
        <h3>Shipping Address:</h3>
        <p>
        ${order.address.fullName}<br>
        ${order.address.street}<br>
        ${order.address.city},
        ${order.address.state}
        ${order.address.postalCode}<br>
        ${order.address.country}
        </p>`;

        await sendEmail(req.user.email, emailSubject, emailBody);

        res.status(201).json(order);
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        console.error("Order Creation Error:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    } finally {
        await session.endSession();
    }
};

const getOrderByUserId = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate(
            "items.product",
            "name price"
        );
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .populate("items.product", "name image price");
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        const allowedStatus = ["pending", "shipped", "cancelled", "delivered"];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                message: "Invalid status",
            });
        }

        order.status = status;

        await order.save();

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

export { createOrder, getOrderByUserId, getAllOrders, updateOrderStatus };
