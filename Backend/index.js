import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import supplierRoutes from './routes/supplierRoutes.js';
import UserRouter from "./routes/auth.js";
import cookieParser from "cookie-parser";
import userRoutes from './routes/userRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import inventoryRoutes from "./routes/inventoryRoutes.js";
dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // Parsing JSON data
app.use(express.urlencoded({ extended: true })); // Parsing URL-encoded data
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend's URL
    credentials: true,
  })
);

// Routes
app.use("/auth", UserRouter);

// Routes
app.use('/api/staff', staffRoutes);

// Use Routes
app.use("/api/users", userRoutes); // Base route for user management

// app.use("/inventory", inventoryRoutes);
// app.use("/requests", requestRoutes);
// app.use("/reports", reportRoutes);

// Routes
app.use('/api/supplier', supplierRoutes);

// Use Inventory Routes
app.use("/api/inventory", inventoryRoutes);

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/authentication")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));


// Start server
app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running");
});