import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.authToken;
  console.log(token);
  
  if (!token) {
    console.log("Accessed denied due to no token");
    
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
