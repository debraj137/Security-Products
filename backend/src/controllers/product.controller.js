import { Product } from "../models/Product.js";
import { AppError } from "../utils/appError.js";

export const getProducts = async (_req, res, next) => {
  try {
    const products = await Product.find().sort({ price: 1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const getPublicProducts = async (_req, res, next) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ price: 1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};
