import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const verifyToken = (req, res, next) => {
  const token = req.cookies.authToken;
  console.log(token);

  if (!token) {
    console.log("Access denied due to no token");

    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log(err.message);

      return res.status(401).json({ message: "Invalid or expired token." });
    }

    console.log("No error");

    req.user = decoded;
    next();
  });
};
