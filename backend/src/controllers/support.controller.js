import { SupportRequest } from "../models/SupportRequest.js";

export const createSupportRequest = async (req, res, next) => {
  try {
    const request = await SupportRequest.create(req.body);
    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
};
