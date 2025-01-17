import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

// Signup Controller
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, role } = req.body;

    // Trim input fields
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    // Validate input
    if (!trimmedFullName || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (trimmedFullName.length < 3) {
      return res.status(400).json({ message: "Full name must be at least 3 characters long." });
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    if (trimmedPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists. Please log in." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(trimmedPassword, salt);

    const newUser = new User({
      fullName: trimmedFullName,
      email: trimmedEmail,
      password: hashedPassword,
      role: role || "Admin",
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ message: "Internal server error. Please try again later." });
  }
};

// Signin Controller
export const signin = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(trimmedPassword, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password." });
    }

    if (role && role !== existingUser.role) {
      return res.status(403).json({ message: "Incorrect role." });
    }

    const token = jwt.sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
        fullName: existingUser.fullName,
        role: existingUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Signin successful",
      data: {
        user: {
          id: existingUser._id,
          fullName: existingUser.fullName,
          email: existingUser.email,
          role: existingUser.role,
        },
      },
    });
  } catch (error) {
    console.error("Error in signin:", error);
    res.status(500).json({ message: "Internal server error. Please try again later." });
  }
};

// Current User Controller
export const getCurrentUser = async (req, res) => {
  try {
    console.log(req);
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in /currentUser:", error);
    res.status(500).json({ message: "Internal server error. Please try again later." });
  }
};
