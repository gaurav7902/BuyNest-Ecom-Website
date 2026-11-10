import Order from "../models/Order.js";

const getOrderByUserId = async (req, res) => {
    try {
        const orders = await Order.find({user: req.user._id}).populate(
            "items.product",
            "name price",
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
        const {status} = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({message: "Order not found"});
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

export {getOrderByUserId, getAllOrders, updateOrderStatus};
