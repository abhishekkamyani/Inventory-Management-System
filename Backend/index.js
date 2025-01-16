import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import UserRouter from "./routes/auth.js";
import cookieParser from "cookie-parser";

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

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/authentication")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));


// Start server
app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running");
});
