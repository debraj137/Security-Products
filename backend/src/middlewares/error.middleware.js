export const notFoundHandler = (_req, res) => {
  res.status(404).json({ message: "Route not found" });
};

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }

  res.status(statusCode).json({
    message
  });
};
