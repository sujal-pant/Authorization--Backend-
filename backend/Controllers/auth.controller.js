import User from "../Model/UserModel.js";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendPasswordResetSuccessfull,
  sendPasswordResetMail,
  sendverificationmail,
  sendWelcomeEmail,
} from "../Mailtrap/emails.js";
import crypto from "crypto";
import { Query } from "mongoose";
// Signup handler
export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // Ensure all fields are provided
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Please enter all the fields" });
    }

    // Check if the user already exists
    const userAlreadyExist = await User.findOne({ email });
    if (userAlreadyExist) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Create a verification token and user
    const verificationToken = Math.floor(100000 + Math.random() * 900000);
    const user = new User({
      email,
      password: hash,
      name,
      verificationToken,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
    });

    // Save the user in the database
    await user.save();

    // Generate token and set it in cookies
    generateTokenAndSetCookie(res, user._id);

    //mail
    await sendverificationmail(user.email, verificationToken);

    // Send a response with the newly created user (excluding password)
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(409).json({ message: "Invalid verification code" });
    }
    user.isverified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    await sendWelcomeEmail(user.email, user.name);
    res.status(201).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in verifyEmail ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login handler
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(409).json({ message: "User does not exist" });
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(409).json({ message: "Invalid password" });
      } else {
        generateTokenAndSetCookie(res, user._id);
        user.lastlogin = Date.now();
        await user.save();

        res.status(201).json({
          success: true,
          message: "Logged in successfully",
          user: {
            ...user._doc,
            password: undefined,
          },
        });
      }
    }
  } catch (error) {
    console.log("error in login ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Logout handler
export const logout = async (req, res) => {
  res.clearcookie("token");

  res.status(201).json({ success: true, message: "Logged out successfully" });
};
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(409).json({ message: "User does not exist" });
    }

    // Generate the reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetPasswordTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour expiration

    // Assign the reset token and expiration to the user instance
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpires = resetPasswordTokenExpiresAt;

    // Save the user with the updated fields
    await user.save();

    // Send reset password email
    await sendPasswordResetMail(
      user.email,
      `http://localhost:5173/reset-password/${resetToken}`
    );

    // Respond with success
    res.status(201).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (err) {
    // Log the error for debugging
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userID).select("-password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in checkAuth ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpires: { $gt: Date.now() },
    });
    

    if (!user) {
      return res.status(409).json({ message: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    user.password = hashedPassword;

    // Save the updated user
    await user.save();

    // Send a success email notification
    await sendPasswordResetSuccessfull(user.email);

    // Respond with success, ensuring not to expose the password
    res.status(201).json({
      success: true,
      message: "Password reset successfully",
      user: {
        ...user._doc,
        password: undefined, // Do not expose the password
      },
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
