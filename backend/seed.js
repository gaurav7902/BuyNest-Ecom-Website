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
        imageUrl:
            "https://tetro.in/cdn/shop/files/15PMBlue-S1.jpg?v=1744871696&width=1080",
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
        imageUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGNcAnUfcd9DyiPPtv-OB1v6WWzCA0ZNSI7g&s",
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
        imageUrl:
            "https://www.designinfo.in/wp-content/uploads/2023/08/Sony-WH-1000XM5-Black-15-e1691557639418.webp",
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
        imageUrl:
            "https://cdn.sanity.io/images/d6wcctii/production/f9c8343def07aae960bf1eadb01732fbbde9ea00-1070x760.jpg",
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
        imageUrl:
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
    {
        name: "Wireless Noise-Cancelling Headphones",
        description:
            "Immersive sound experience with advanced active noise cancellation.",
        price: 299.99,
        category: "Electronics",
        stock: 15,
        imageUrl:
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        rating: 4.8,
        numReviews: 24,
    },
    {
        name: "Minimalist Modern Chair",
        description:
            "A stylish and comfortable addition to any contemporary living room.",
        price: 150.0,
        category: "Furniture",
        stock: 30,
        imageUrl:
            "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        rating: 4.2,
        numReviews: 12,
    },
    {
        name: "Professional DSLR Camera",
        description:
            "Capture stunning moments with high-resolution clarity and speed.",
        price: 1199.99,
        category: "Electronics",
        stock: 8,
        imageUrl:
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        rating: 4.9,
        numReviews: 50,
    },
    {
        name: "Classic White Sneakers",
        description:
            "Versatile and comfortable, a staple for any casual outfit.",
        price: 85.0,
        category: "Clothing",
        stock: 50,
        imageUrl:
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        rating: 4.5,
        numReviews: 89,
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
            seedUsers.map(async (user) => {
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
                        image: products[0].imageUrl,
                        quantity: 1,
                        price: products[0].price,
                    },
                    {
                        product: products[2]._id,
                        name: products[2].name,
                        image: products[2].imageUrl,
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
                        image: products[3].imageUrl,
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
