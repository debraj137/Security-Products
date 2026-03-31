import { Notification } from "../models/Notification.js";

export const createNotification = async ({ userId, type, title, message }) => {
  return Notification.create({ userId, type, title, message });
};
