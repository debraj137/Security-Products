export type Product = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  features: string[];
  price: number;
  currency: string;
  isActive: boolean;
  productCode: string;
};

export type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  companyName: string;
  gstDetails: string;
  installationLocation: string;
  referralSource: string;
  role: "customer" | "admin";
  status: string;
};

export type Order = {
  _id: string;
  amount: number;
  paymentStatus: string;
  orderStatus: string;
  activationStatus: string;
  activationNotes: string;
  purchaseDate: string;
  productId: Product;
};

export type Notification = {
  _id: string;
  type: string;
  title: string;
  message: string;
  readStatus: boolean;
  createdAt: string;
};
