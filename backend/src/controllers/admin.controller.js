import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
import { Payment } from "../models/Payment.js";
import { Product } from "../models/Product.js";
import { SupportRequest } from "../models/SupportRequest.js";
import { AppError } from "../utils/appError.js";
import { createNotification } from "../services/notification.service.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";

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
    res.json(customers.map((customer) => sanitizeUser(customer)));
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (_req, res, next) => {
  try {
    const orders = await Order.find().populate("customerId productId activatedBy placedBy").sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const createOrderForCustomer = async (req, res, next) => {
  try {
    const {
      existingCustomerId,
      fullName,
      email,
      phone,
      address,
      companyName = "",
      gstDetails = "",
      installationLocation = "",
      referralSource = "Admin assisted purchase",
      productId,
      paymentMethod = "manual",
      markAsPaid = true
    } = req.body;

    if (!productId) {
      throw new AppError("productId is required");
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw new AppError("Selected product is unavailable", 404);
    }

    let customer = null;
    let createdNewCustomer = false;
    let setupResetToken = null;

    if (existingCustomerId) {
      customer = await User.findOne({ _id: existingCustomerId, role: "customer" });
      if (!customer) {
        throw new AppError("Customer not found", 404);
      }
    } else {
      if (!fullName || !email || !phone || !address) {
        throw new AppError("fullName, email, phone and address are required for a new customer");
      }

      const normalizedEmail = email.toLowerCase();
      const existingUser = await User.findOne({ email: normalizedEmail });

      if (existingUser && existingUser.role !== "customer") {
        throw new AppError("This email is already used by a non-customer account", 409);
      }

      if (existingUser) {
        customer = existingUser;
      } else {
        const temporaryPassword = crypto.randomBytes(8).toString("hex");
        const resetToken = crypto.randomBytes(16).toString("hex");
        setupResetToken = resetToken;

        customer = await User.create({
          fullName,
          email: normalizedEmail,
          phone,
          address,
          companyName,
          gstDetails,
          installationLocation,
          referralSource,
          passwordHash: await bcrypt.hash(temporaryPassword, 12),
          resetPasswordToken: resetToken,
          role: "customer",
          status: "active"
        });

        createdNewCustomer = true;

        await createNotification({
          userId: customer._id,
          type: "registration_success",
          title: "Your account was created by our team",
          message: `An admin created your account and purchased a product for you. Use this reset token to set your password: ${resetToken}`
        });
      }
    }

    const order = await Order.create({
      customerId: customer._id,
      placedBy: req.user._id,
      productId: product._id,
      amount: product.price,
      paymentStatus: markAsPaid ? "paid" : "pending",
      orderStatus: "confirmed",
      activationStatus: "inactive"
    });

    await Payment.create({
      orderId: order._id,
      customerId: customer._id,
      transactionId: `TXN-${Date.now()}`,
      paymentMethod,
      amount: product.price,
      paymentStatus: markAsPaid ? "paid" : "pending"
    });

    await createNotification({
      userId: customer._id,
      type: "order_placed",
      title: "Order placed successfully",
      message: `Your order for ${product.name} has been placed by our admin team and is awaiting activation.`
    });

    const populatedOrder = await Order.findById(order._id).populate("customerId productId placedBy");

    res.status(201).json({
      order: populatedOrder,
      customer: sanitizeUser(customer),
      createdNewCustomer,
      setupResetToken
    });
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
