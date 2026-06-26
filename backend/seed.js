import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";

dotenv.config();

const seedUsers = [
    {
        name: "Admin User",
        email: "admin@buynest.com",
        password: "Admin@123",
        role: "admin",
        verified: true,
    },
    {
        name: "John Doe",
        email: "john@example.com",
        password: "User@123",
        role: "user",
        verified: true,
    },
    {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "User@123",
        role: "user",
        verified: true,
    },
];

const seedProducts = [
    {
        name: "iPhone 15 Pro",
        description:
            "Latest Apple iPhone with A17 Pro chip, titanium design, and professional camera system.",
        price: 999,
        category: "Electronics",
        stock: 50,
        rating: 4.8,
        numReviews: 120,
    },
    {
        name: "Samsung Galaxy S24 Ultra",
        description:
            "Powerful Android smartphone with S-Pen, AI features, and an incredible zoom camera.",
        price: 1199,
        category: "Electronics",
        stock: 40,
        rating: 4.7,
        numReviews: 95,
    },
    {
        name: "Sony WH-1000XM5",
        description:
            "Industry-leading noise cancelling headphones with exceptional sound quality and comfort.",
        price: 349,
        category: "Electronics",
        stock: 100,
        rating: 4.9,
        numReviews: 200,
    },
    {
        name: "Nike Air Jordan 1",
        description:
            "Classic high-top sneakers with iconic style and durable leather construction.",
        price: 170,
        category: "Clothing",
        stock: 30,
        rating: 4.6,
        numReviews: 80,
    },
    {
        name: "Adidas Ultraboost 22",
        description:
            "High-performance running shoes with responsive cushioning and a supportive fit.",
        price: 180,
        category: "Clothing",
        stock: 60,
        rating: 4.5,
        numReviews: 110,
    },
    {
        name: "Levi's 501 Original Fit Jeans",
        description:
            "Timeless straight-leg denim jeans, a staple in every wardrobe.",
        price: 60,
        category: "Clothing",
        stock: 150,
        rating: 4.4,
        numReviews: 300,
    },
    {
        name: "Ninja AF101 Air Fryer",
        description:
            "Compact and efficient air fryer for healthy, crispy meals with minimal oil.",
        price: 120,
        category: "Home & Kitchen",
        stock: 70,
        rating: 4.7,
        numReviews: 150,
    },
    {
        name: "Keurig K-Elite Coffee Maker",
        description:
            "Versatile coffee brewer with multiple brew sizes and a large water reservoir.",
        price: 189,
        category: "Home & Kitchen",
        stock: 40,
        rating: 4.3,
        numReviews: 250,
    },
    {
        name: "Dyson V15 Detect Vacuum",
        description:
            "Powerful cordless vacuum with laser detection for invisible dust and deep cleaning.",
        price: 749,
        category: "Home & Kitchen",
        stock: 20,
        rating: 4.8,
        numReviews: 90,
    },
];

const seedData = async () => {
    try {
        await connectDB();
        console.log("Connected to MongoDB for seeding...");

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        console.log("Existing data cleared.");

        // Hash passwords and seed users
        const usersWithHashedPasswords = await Promise.all(
            seedUsers.map(async user => {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user.password, salt);
                return { ...user, password: hashedPassword };
            })
        );
        await User.insertMany(usersWithHashedPasswords);
        console.log("Users seeded successfully.");

        // Seed products
        await Product.insertMany(seedProducts);
        console.log("Products seeded successfully.");

        // Seed some initial orders
        const users = await User.find({});
        const products = await Product.find({});

        const sampleOrders = [
            {
                user: users[0]._id,
                items: [
                    {
                        product: products[0]._id,
                        name: products[0].name,
                        image:
                            products[0].imageUrl ||
                            "https://via.placeholder.com/150",
                        quantity: 1,
                        price: products[0].price,
                    },
                    {
                        product: products[2]._id,
                        name: products[2].name,
                        image:
                            products[2].imageUrl ||
                            "https://via.placeholder.com/150",
                        quantity: 1,
                        price: products[2].price,
                    },
                ],
                totalAmount: products[0].price + products[2].price,
                status: "delivered",
                isPaid: true,
                address: {
                    fullName: "Admin User",
                    street: "123 Admin St",
                    city: "Admin City",
                    state: "Admin State",
                    postalCode: "12345",
                    country: "USA",
                },
                paymentId: "pay_123456789",
            },
            {
                user: users[1]._id,
                items: [
                    {
                        product: products[3]._id,
                        name: products[3].name,
                        image:
                            products[3].imageUrl ||
                            "https://via.placeholder.com/150",
                        quantity: 2,
                        price: products[3].price,
                    },
                ],
                totalAmount: products[3].price * 2,
                status: "pending",
                isPaid: false,
                address: {
                    fullName: "John Doe",
                    street: "456 User Ave",
                    city: "User City",
                    state: "User State",
                    postalCode: "67890",
                    country: "USA",
                },
            },
        ];

        await Order.insertMany(sampleOrders);
        console.log("Orders seeded successfully.");

        console.log("Database seeding completed successfully!");
    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

seedData();
