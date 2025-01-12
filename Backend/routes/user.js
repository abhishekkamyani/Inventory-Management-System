import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const router = express.Router();

// POST /auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, role } = req.body;

    // Trim input fields to remove accidental spaces
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    // Validate input
    if (!trimmedFullName || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Full name validation
    if (trimmedFullName.length < 3) {
      return res.status(400).json({ message: "Full name must be at least 3 characters long." });
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Password length check
    if (trimmedPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    // Password confirmation check
    if (trimmedPassword !== trimmedConfirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists. Please log in." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(trimmedPassword, salt);

    // Create a new user
    const newUser = new User({
      fullName: trimmedFullName,
      email: trimmedEmail,
      password: hashedPassword,
      role: role || "Admin", // Default to Admin if role not provided
    });

    // Save the user in the database
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ message: "Internal server error. Please try again later." });
  }
});

// POST /auth/signin
router.post('/signin', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Trim input fields to remove accidental spaces
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Validate input
    if (!trimmedEmail || !trimmedPassword) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Check if the user exists
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(trimmedPassword, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password." });
    }

    // Check role (if needed, depending on your use case)
    if (role && role !== existingUser.role) {
      return res.status(403).json({ message: "Incorrect role." });
    }

    // Generate JWT token using secret from .env
    const token = jwt.sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
        fullName: existingUser.fullName, // Include full name in the token payload
        role: existingUser.role,
      },
      process.env.JWT_SECRET, // Use the JWT secret from the .env file
      { expiresIn: '1h' } // Token expiration time (1 hour in this case)
    );

    res.status(200).json({
      message: "Signin successful",
      token,
      user: {
        id: existingUser._id,
        fullName: existingUser.fullName,
        email: existingUser.email,
        role: existingUser.role,
      },
    });
  } catch (error) {
    console.error("Error in signin:", error);
    res.status(500).json({ message: "Internal server error. Please try again later." });
  }
});

export { router as UserRouter };
