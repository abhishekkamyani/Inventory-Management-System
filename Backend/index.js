import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

// Import routes
import UserRouter from "./routes/auth.js";
import requisitionRoutes from "./routes/requisitionRoutes.js";
import directorRoutes from "./routes/directorRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import qrRoutes from "./routes/qrRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- CHANGE #1: Make CORS dynamic ---
// Use an environment variable for the frontend URL.
// In Vercel, you will set FRONTEND_URL to your deployed frontend's address.
app.use(cors({
  origin: '*'
}));
app.use(express.static("public"));


// Routes
app.use("/api/auth", UserRouter);
app.use("/api/staff", staffRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/users", userRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/requisitions", requisitionRoutes);
app.use("/api/director", directorRoutes);

// MongoDB connection (remains the same)
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// --- CHANGE #2: Remove the server start logic ---
// Vercel handles the server creation, so we delete this block.
/*
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
*/

// --- CHANGE #3: Export the 'app' instance ---
// This allows Vercel to take your Express app and run it as a serverless function.
export default app;