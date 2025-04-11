const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "support staff") {
    return res.status(403).json({ message: "Access denied. Admins or Support Staff only." });
  }
  next();
};

module.exports = authorizeAdmin;