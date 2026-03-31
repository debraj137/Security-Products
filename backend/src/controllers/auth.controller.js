import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../models/User.js";
import { AppError } from "../utils/appError.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";
import { signToken } from "../utils/jwt.js";
import { createNotification } from "../services/notification.service.js";

const buildAuthResponse = (user) => ({
  token: signToken({ userId: user._id, role: user.role }),
  user: sanitizeUser(user)
});

export const register = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      confirmPassword,
      address,
      companyName,
      gstDetails,
      installationLocation,
      referralSource
    } = req.body;

    if (!fullName || !email || !phone || !password || !confirmPassword || !address || !installationLocation) {
      throw new AppError("Please provide all required registration fields");
    }

    if (password !== confirmPassword) {
      throw new AppError("Passwords do not match");
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError("An account with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      address,
      companyName,
      gstDetails,
      installationLocation,
      referralSource,
      role: "customer"
    });

    await createNotification({
      userId: user._id,
      type: "registration_success",
      title: "Welcome to AI Security",
      message: "Your account has been created successfully."
    });

    res.status(201).json(buildAuthResponse(user));
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    res.json(buildAuthResponse(user));
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user) {
      throw new AppError("No account found for that email", 404);
    }

    const resetToken = crypto.randomBytes(16).toString("hex");
    user.resetPasswordToken = resetToken;
    await user.save();

    await createNotification({
      userId: user._id,
      type: "password_reset",
      title: "Password reset requested",
      message: `Use this reset token to reset your password: ${resetToken}`
    });

    res.json({
      message: "Password reset token generated. Check notifications or integrate email delivery next.",
      resetToken
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      throw new AppError("Passwords do not match");
    }

    const user = await User.findOne({ resetPasswordToken: token });
    if (!user) {
      throw new AppError("Invalid reset token", 400);
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetPasswordToken = null;
    await user.save();

    await createNotification({
      userId: user._id,
      type: "password_reset_success",
      title: "Password updated",
      message: "Your password has been reset successfully."
    });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
};

