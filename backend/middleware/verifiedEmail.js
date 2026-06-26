import User from "../models/User.js";

const verifiedEmail = async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.verified) {
            return res
                .status(400)
                .json({ message: "Please verify your email first" });
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export default verifiedEmail;
