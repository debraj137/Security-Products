import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    transactionId: { type: String, required: true },
    paymentMethod: { type: String, default: "manual" },
    amount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "paid" },
    paymentDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);
