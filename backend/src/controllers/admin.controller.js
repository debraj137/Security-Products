import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
import { Payment } from "../models/Payment.js";
import { SupportRequest } from "../models/SupportRequest.js";
import { AppError } from "../utils/appError.js";
import { createNotification } from "../services/notification.service.js";

export const getDashboard = async (_req, res, next) => {
  try {
    const [
      totalCustomers,
      totalPurchases,
      revenueRows,
      pendingActivations,
      activeCustomers,
      productWiseSales,
      recentRegistrations,
      recentOrders
    ] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      Order.countDocuments(),
      Payment.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }]),
      Order.countDocuments({ activationStatus: "inactive", orderStatus: "confirmed" }),
      Order.distinct("customerId", { activationStatus: "active" }).then((ids) => ids.length),
      Order.aggregate([
        { $lookup: { from: "products", localField: "productId", foreignField: "_id", as: "product" } },
        { $unwind: "$product" },
        { $group: { _id: "$product.name", sales: { $sum: 1 }, revenue: { $sum: "$amount" } } }
      ]),
      User.find({ role: "customer" }).sort({ createdAt: -1 }).limit(5),
      Order.find().populate("customerId productId").sort({ createdAt: -1 }).limit(5)
    ]);

    res.json({
      totalCustomers,
      totalPurchases,
      revenueSummary: revenueRows[0]?.totalRevenue || 0,
      pendingActivations,
      activeCustomers,
      productWiseSales,
      recentRegistrations,
      recentOrders
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomers = async (_req, res, next) => {
  try {
    const customers = await User.find({ role: "customer" }).sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (_req, res, next) => {
  try {
    const orders = await Order.find().populate("customerId productId activatedBy").sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const updateOrderActivation = async (req, res, next) => {
  try {
    const { activationStatus, activationNotes = "" } = req.body;

    if (!["active", "inactive", "suspended"].includes(activationStatus)) {
      throw new AppError("Invalid activation status");
    }

    const order = await Order.findById(req.params.id).populate("productId customerId");
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    order.activationStatus = activationStatus;
    order.activationNotes = activationNotes;
    order.activatedBy = req.user._id;
    order.activatedAt = new Date();
    await order.save();

    await createNotification({
      userId: order.customerId._id,
      type: activationStatus === "active" ? "product_activated" : "product_status_updated",
      title: `Your ${order.productId.name} access is now ${activationStatus}`,
      message:
        activationStatus === "active"
          ? `Your purchased product has been activated. ${activationNotes}`
          : `Your product access status changed to ${activationStatus}. ${activationNotes}`
    });

    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const upsertAdmin = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      throw new AppError("fullName, email and password are required");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        fullName,
        email: email.toLowerCase(),
        phone: "0000000000",
        address: "Admin address",
        passwordHash,
        role: "admin",
        status: "active"
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(admin);
  } catch (error) {
    next(error);
  }
};

export const getSupportRequests = async (_req, res, next) => {
  try {
    const requests = await SupportRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

export const updateSupportRequest = async (req, res, next) => {
  try {
    const request = await SupportRequest.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!request) {
      throw new AppError("Support request not found", 404);
    }

    res.json(request);
  } catch (error) {
    next(error);
  }
};
