import mongoose from "mongoose";

const supportRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    companyName: { type: String, default: "" },
    message: { type: String, required: true },
    status: { type: String, enum: ["open", "in_progress", "closed"], default: "open" }
  },
  { timestamps: true }
);

export const SupportRequest = mongoose.model("SupportRequest", supportRequestSchema);
