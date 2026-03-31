import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    address: { type: String, required: true, trim: true },
    companyName: { type: String, default: "" },
    gstDetails: { type: String, default: "" },
    installationLocation: { type: String, default: "" },
    referralSource: { type: String, default: "" },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" },
    resetPasswordToken: { type: String, default: null }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
