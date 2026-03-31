import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { seedDefaultProducts } from "./services/seed.service.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDatabase();
  await seedDefaultProducts();

  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});
