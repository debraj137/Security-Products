import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    features: { type: [String], default: [] },
    price: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    isActive: { type: Boolean, default: true },
    productCode: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
