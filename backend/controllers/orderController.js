import Order from "../models/Order.js";
import sendEmail from "../utils/sendEmail.js";
import Product from "../models/Product.js";

const createOrder = async (req, res) => {
    try {
        const { items, totalAmount, address, paymentId } = req.body;

        if (
            !items ||
            items.length === 0 ||
            !totalAmount ||
            !address ||
            !paymentId
        ) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Create a new order object
        const newOrder = new Order({
            user: req.user._id,
            items: items.map(item => ({
                product: item._id,
                name: item.name,
                image: item.image,
                quantity: item.quantity,
                price: item.price,
            })),
            totalAmount,
            address: address,
            paymentId,
        });

        const order = await newOrder.save();

        // Send email notification to the user
        const emailSubject = "Order Confirmation";
        const emailBody = `<h1>Thank you for your order!</h1>
        <p>Your order has been successfully placed.</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Total Amount:</strong> $${order.totalAmount}</p>
        <h3>Shipping Address</h3>
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
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
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
        res.status(500).json({ message: "Internal Server Error" });
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
        res.status(500).json({ message: "Internal Server Error" });
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
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export { createOrder, getOrderByUserId, getAllOrders, updateOrderStatus };
