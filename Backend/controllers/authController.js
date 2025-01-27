import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
import dotenv from 'dotenv';


import crypto from 'crypto';
import nodemailer from 'nodemailer';
dotenv.config();
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

//Get Roles Controller
export const getRoles = async (req, res) => {
  try {
    console.log(req);

    const isAdmin = await User.findOne({ role: "Admin" });

    if (isAdmin) {
      return res.status(200).json({ roles: ["Staff", "Faculty", "Director"] });
    }

    return res.status(200).json({ roles: ["Admin", "Staff", "Faculty", "Director"] });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error. Please try again later." });
  }
}

// Forgot Password Controller
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("email:", email);
    
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex'); // Secure random token

    console.log("Reset Token:", resetToken);

    // Hash the token and set expiration
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // Token valid for 15 minutes
    await user.save();

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      secure:true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <p>Hello ${user.fullName},</p>
        <p>You requested to reset your password. Please click the link below to reset it:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    res.status(200).json({
      message: 'Password reset email sent successfully. Please check your inbox.',
    });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};
// Reset Password Controller


export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Validate token
    if (!token) {
      return res.status(400).json({ message: "Reset token is required." });
    }

    // Validate passwords
    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "Both password fields are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // Hash the provided token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid token
    let user;
    try {
      user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }, // Check if token is still valid
      });
    } catch (err) {
      return res.status(500).json({ message: "Error finding the user. Please try again later." });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token. Please request a new password reset." });
    }

    // Update user's password
    try {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    } catch (err) {
      return res.status(500).json({ message: "Error hashing the password. Please try again later." });
    }

    // Remove reset token fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    try {
      await user.save();
    } catch (err) {
      return res.status(500).json({ message: "Error saving the user. Please try again later." });
    }

    res.status(200).json({ message: "Password reset successful. You can now log in with your new password." });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Internal server error. Please try again later." });
  }
};


export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the token from the URL
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find a user with this token and check if it's still valid
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, // Check if the token is not expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    res.status(200).json({ message: 'Token is valid.', userId: user._id });
  } catch (error) {
    console.error('Error in verifyResetToken:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};







