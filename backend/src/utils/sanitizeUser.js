export const sanitizeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  address: user.address,
  companyName: user.companyName,
  gstDetails: user.gstDetails,
  installationLocation: user.installationLocation,
  referralSource: user.referralSource,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});
