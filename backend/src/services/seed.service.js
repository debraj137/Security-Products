import { Product } from "../models/Product.js";

const defaultProducts = [
  {
    name: "Basic Plan",
    slug: "basic-plan",
    description: "Essential intruder alerting for monitored areas.",
    features: ["Intruder alerting when a person enters a monitored area"],
    price: 4999,
    currency: "INR",
    isActive: true,
    productCode: "BASIC-001"
  },
  {
    name: "Standard Plan",
    slug: "standard-plan",
    description: "Detection with rich email and WhatsApp alert delivery.",
    features: [
      "Intruder alerting when a person enters a monitored area",
      "Sending email alerts with a captured detection image",
      "Sending WhatsApp alerts"
    ],
    price: 9999,
    currency: "INR",
    isActive: true,
    productCode: "STD-001"
  },
  {
    name: "Premium Plan",
    slug: "premium-plan",
    description: "Full alarm automation with multi-channel real-time alerts.",
    features: [
      "Intruder alerting when a person enters a monitored area",
      "Real-time alarm triggering through sound alerts",
      "Sending email alerts with a captured detection image",
      "Sending WhatsApp alerts"
    ],
    price: 14999,
    currency: "INR",
    isActive: true,
    productCode: "PREM-001"
  }
];

export const seedDefaultProducts = async () => {
  for (const product of defaultProducts) {
    const existing = await Product.findOne({ slug: product.slug });
    if (!existing) {
      await Product.create(product);
    }
  }
};
