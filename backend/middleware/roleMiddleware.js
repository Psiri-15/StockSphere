export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user ? req.user.role : 'Guest'}) is not allowed to access this resource.`,
      });
    }
    next();
  };
};

export const requireApprovedSeller = (req, res, next) => {
  if (req.user.role === 'Admin') {
    return next(); // Admin has override
  }

  if (req.user.role !== 'Seller') {
    return res.status(403).json({
      success: false,
      message: 'Seller privileges required for this action.',
    });
  }

  const status = req.user.sellerDetails?.approvalStatus;
  if (status !== 'Approved') {
    return res.status(403).json({
      success: false,
      message: `Seller account is currently ${status || 'Pending'}. You can only manage inventory and products once approved by Admin.`,
      approvalStatus: status || 'Pending',
      rejectionReason: req.user.sellerDetails?.rejectionReason || '',
    });
  }

  next();
};
