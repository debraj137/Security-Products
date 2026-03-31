import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Payment } from "../models/Payment.js";
import { AppError } from "../utils/appError.js";
import { createNotification } from "../services/notification.service.js";

export const createOrder = async (req, res, next) => {
  try {
    const { productId, paymentMethod = "manual", markAsPaid = true } = req.body;
    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      throw new AppError("Selected product is unavailable", 404);
    }

    const order = await Order.create({
      customerId: req.user._id,
      productId: product._id,
      amount: product.price,
      paymentStatus: markAsPaid ? "paid" : "pending",
      orderStatus: "confirmed",
      activationStatus: "inactive"
    });

    await Payment.create({
      orderId: order._id,
      customerId: req.user._id,
      transactionId: `TXN-${Date.now()}`,
      paymentMethod,
      amount: product.price,
      paymentStatus: markAsPaid ? "paid" : "pending"
    });

    await createNotification({
      userId: req.user._id,
      type: "order_placed",
      title: "Order placed successfully",
      message: `Your order for ${product.name} has been placed and is awaiting activation.`
    });

    const populatedOrder = await Order.findById(order._id).populate("productId");
    res.status(201).json(populatedOrder);
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customerId: req.user._id }).populate("productId").sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ customerId: req.user._id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

export const getMyAccessibleProducts = async (req, res, next) => {
  try {
    const activeOrders = await Order.find({ customerId: req.user._id, activationStatus: "active" }).populate("productId");
    res.json(activeOrders);
  } catch (error) {
    next(error);
  }
};
