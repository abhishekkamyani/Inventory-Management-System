import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

// Import routes
import UserRouter from "./routes/auth.js";
import requisitionRoutes from "./routes/requisitionRoutes.js";

import staffRoutes from "./routes/staffRoutes.js";
import qrRoutes from "./routes/qrRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
// import requestRoutes from "./routes/requestRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json()); // Parse JSON data
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(cookieParser()); // Parse cookies
app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend's URL
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);

// Routes
app.use("/auth", UserRouter); // Authentication routes
app.use("/api/staff", staffRoutes); // Staff management routes
app.use("/api/qr", qrRoutes); // QR scanner routes
app.use("/api/users", userRoutes); // User management routes
app.use("/api/supplier", supplierRoutes); // Supplier management routes
app.use("/api/inventory", inventoryRoutes); // Inventory management routes
// app.use("/api/requests", requestRoutes); // Request management routes
app.use("/api/reports", reportRoutes); // Report management routes

app.use("/api/requisitions", requisitionRoutes);


// MongoDB connection (unchanged)
mongoose
  .connect("mongodb://127.0.0.1:27017/authentication")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});