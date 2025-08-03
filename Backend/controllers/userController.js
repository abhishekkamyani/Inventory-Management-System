import { User } from "../models/User.js";
import bcrypt from "bcrypt"; // Import bcrypt
import crypto from 'crypto';
import { transporter, sendVerificationEmail } from "./authController.js";
import { generateEmailToAdmin } from "../utils.js";
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
// export const createUser = async (req, res) => {
//   const { fullName, email, password, role } = req.body;

//   try {
//     // 1. Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // 2. Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 3. Create new user (default status: Deactive for non-admins)
//     const newUser = new User({
//       fullName,
//       email,
//       password: hashedPassword,
//       role,
//       status: role === "Admin" ? "Active" : "Deactive",
//     });

//     // 4. Save user to DB
//     await newUser.save();

//     // 5. Notify admin if user is not an admin
//     if (role !== "Admin") {
//       const subject = "🆕 New User Registration Request";
//       const message = `
//         <h3>A new user has registered and needs activation</h3>
//         <p><strong>Name:</strong> ${fullName}</p>
//         <p><strong>Email:</strong> ${email}</p>
//         <p><strong>Role:</strong> ${role}</p>
//         <p>Status: <strong>Deactive</strong></p>
//         <p>Please review and activate the user in the admin dashboard.</p>
//       `;
//       await generateEmailToAdmin(subject, message);
//     }

//     // 6. Respond to the client
//     res.status(201).json({ message: "User created successfully", user: newUser });
//   } catch (error) {
//     console.error("Error in createUser:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// Create new user with email verification (Admin-created users)
export const createUser = async (req, res) => {
  const { fullName, email, password, role } = req.body;

  try {
    // 1. Input validation
    const trimmedFullName = fullName?.trim();
    const trimmedEmail = email?.trim();
    const trimmedPassword = password?.trim();

    if (!trimmedFullName || !trimmedEmail || !trimmedPassword) {
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

    // 2. Check if user exists
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists." });
    }

    // 3. Generate verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    // 5. Create new user
    const newUser = new User({
      fullName: trimmedFullName,
      email: trimmedEmail,
      password: hashedPassword,
      role: role || "Staff", // Default to Staff for admin-created users
      status: role === "Admin" ? "Active" : "Deactive",
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
      createdBy: req.user?.userId // Optional: track who created this user
    });

    await newUser.save();

    // 6. Send verification email using the existing function from authController
    await sendVerificationEmail(trimmedEmail, verificationToken, trimmedFullName);

    // 7. Notify admin if user is not an admin
    if (role !== "Admin") {
      const subject = "🆕 New User Created - Requires Activation";
      const message = `
        <h3>A new user has been created and needs activation</h3>
        <p><strong>Name:</strong> ${trimmedFullName}</p>
        <p><strong>Email:</strong> ${trimmedEmail}</p>
        <p><strong>Role:</strong> ${role}</p>
        <p>Status: <strong>${role === "Admin" ? "Active" : "Deactive"}</strong></p>
        <p>After the user verifies their email, please activate their account in the admin dashboard.</p>
      `;
      await transporter.sendMail({
        from: `"Support Team" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL, // Make sure to set this in your .env
        subject: subject,
        html: message
      });
    }

    // 8. Return response
    res.status(201).json({ 
      success: true,
      message: "User created successfully. Verification email sent.",
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        requiresVerification: !newUser.isVerified
      }
    });

  } catch (error) {
    console.error("Error in createUser:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error during user creation",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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




// @desc    Get current user
// @route   GET /api/users/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.userId; // Ensure this matches the key in the token
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/update
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.userId; // Assuming userId is attached to the request
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fullName if provided
    if (req.body.fullName) {
      user.fullName = req.body.fullName;
    }

    // Update password if provided
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
    });
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

