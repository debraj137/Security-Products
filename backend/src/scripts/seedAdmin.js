import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/db.js";
import { User } from "../models/User.js";

const run = async () => {
  await connectDatabase();

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@123", 12);

  const admin = await User.findOneAndUpdate(
    { email: (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase() },
    {
      fullName: process.env.ADMIN_NAME || "Platform Admin",
      email: (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase(),
      phone: "0000000000",
      address: "Admin address",
      passwordHash,
      role: "admin",
      status: "active"
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Admin ready: ${admin.email}`);
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
