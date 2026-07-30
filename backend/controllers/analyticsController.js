import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const getAdminStats = async (req, res) => {
    try {
        const orders = await Order.find({ isPaid: true });
        const totalOrders = orders.length;

        const totalRevenue = orders.reduce(
            (acc, order) => acc + order.totalAmount,
            0
        );

        const totalProducts = await Product.countDocuments({});
        const totalUsers = await User.countDocuments({});

        res.status(200).json({
            success: true,
            totalRevenue,
            totalOrders,
            totalProducts,
            totalUsers,
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch admin stats",
            error: error.message,
        });
    }
};

export { getAdminStats };
