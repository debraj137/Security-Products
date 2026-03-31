import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    placedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    amount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    orderStatus: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
    activationStatus: { type: String, enum: ["inactive", "active", "suspended"], default: "inactive" },
    purchaseDate: { type: Date, default: Date.now },
    activatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    activatedAt: { type: Date, default: null },
    activationNotes: { type: String, default: "" }
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);

