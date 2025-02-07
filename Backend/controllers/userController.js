import { User } from "../models/User.js";
import bcrypt from "bcrypt"; // Import bcrypt
// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create new user (Register)
export const createUser = async (req, res) => {
  const { fullName, email, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
      status: role === "Admin" ? "Active" : "Deactive",
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error in createUser:", error); // Log the error for debugging
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get active users count for dashboard
export const getActiveUsersCount = async (req, res) => {
  try {
    const activeUsersCount = await User.countDocuments({ status: "Active" });
    res.status(200).json({ activeUsersCount });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  const { fullName, email, role } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, email, role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user stats
export const getUserStats = async (req, res) => {
  try {
    const activeUsers = await User.countDocuments({ status: "Active" });

    res.status(200).json({ activeUsers });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    // Validate the status
    if (!["Active", "Deactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update the user's status
    user.status = status;
    await user.save();

    res.status(200).json({ message: "User status updated successfully.", user });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



