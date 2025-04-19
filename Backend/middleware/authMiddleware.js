import jwt from "jsonwebtoken";

export const verifyAuth = (req, res, next) => {
  try {
    const token = req.cookies.authToken; // Standardized token key

    if (!token) {
      console.warn("Unauthorized access attempt: No token provided.");
      return res.status(403).json({ message: "Access denied. No token provided." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("JWT Error:", err.message);
        return res.status(401).json({ message: "Invalid or expired token." });
      }

      req.user = decoded; // Attach user data to request
      next(); // Proceed to the next middleware
    });
  } catch (error) {
    console.error("Authentication Middleware Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



export const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return res.status(403).json({ message: "Access denied. Only admins can perform this action." });
  }
  next();
};


export const verifyStaff = (req, res, next) => {
  try {
    const token = req.cookies.authToken; // Consistent with verifyAuth

    if (!token) {
      console.warn("Unauthorized staff access attempt: No token provided.");
      return res.status(403).json({ message: "Access denied. No token provided." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("JWT Error in staff verification:", err.message);
        return res.status(401).json({ message: "Invalid or expired token." });
      }

      // Check if user has staff role
      if (!decoded.role || decoded.role !== "Staff") {
        console.warn(`Unauthorized staff access attempt by ${decoded.role || 'unknown'} role`);
        return res.status(403).json({ 
          message: "Access denied. Only staff members can perform this action." 
        });
      }

      req.user = decoded; // Attach user data to request
      next(); // Proceed to the next middleware
    });
  } catch (error) {
    console.error("Staff Verification Middleware Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};