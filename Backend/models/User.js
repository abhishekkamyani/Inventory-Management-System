import mongoose from "mongoose";
import bcrypt from "bcrypt"; // For password hashing

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Full name must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["Admin", "Staff", "Faculty", "Director"],
      default: "Admin",
    },
    status: {
      type: String,
      enum: ["Active", "Deactive"],
      default: function () {
        return this.role === "Admin" ? "Active" : "Deactive";
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpires: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
    createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  },
  { timestamps: true }
);

// Method to compare passwords during login
UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Create the User model
const UserModel = mongoose.model("User", UserSchema);

export { UserModel as User };