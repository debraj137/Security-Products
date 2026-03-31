import { User } from "../models/User.js";
import { AppError } from "../utils/appError.js";
import { verifyToken } from "../utils/jwt.js";

export const authenticate = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.userId);

    if (!user) {
      throw new AppError("User not found", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError("Not authorized for this resource", 403));
  }

  next();
};
