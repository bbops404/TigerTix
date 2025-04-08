// FIXED authenticate.js
const jwt = require("jsonwebtoken");
const Redis = require("ioredis");

const redis = new Redis(); // Initialize Redis connection

const authenticate = async (req, res, next) => {
  try {
    // ✅ Extract token from HTTP-only cookies instead of headers
    const token = req.cookies?.token;

    if (!token) {
      console.log("🚨 No token found in cookies!");
      return res
        .status(401)
        .json({ message: "Unauthorized. No token provided." });
    }

    console.log("🔑 Received token from cookies:", token); // Debugging

    // ✅ Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      console.log("🚨 Invalid token!");
      return res.status(401).json({ message: "Unauthorized. Invalid token." });
    }

    // Check for either userId or user_id in the decoded token
    const userId = decoded.userId || decoded.user_id;
    if (!userId) {
      console.log("🚨 No user ID in token!");
      return res
        .status(401)
        .json({ message: "Unauthorized. Invalid token data." });
    }

    console.log("✅ Decoded user data:", decoded); // Debugging

    // ✅ Check if token exists in Redis (session validation)
    const storedToken = await redis.get(`session:${userId}`);

    if (!storedToken || storedToken !== token) {
      console.log("🚨 Token not found in Redis or does not match!");
      return res
        .status(401)
        .json({ message: "Unauthorized. Session expired or invalid." });
    }

    console.log("✅ Token is valid and exists in Redis."); // Debugging

    // Normalize the user object to include both forms of ID for compatibility
    req.user = {
      ...decoded,
      userId: userId,
      user_id: userId,
    };

    next(); // Move to the next middleware/route handler
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Unauthorized. Invalid session." });
  }
};

module.exports = authenticate;
