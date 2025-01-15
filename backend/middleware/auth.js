const jwt = require("jsonwebtoken");
const { User } = require("../models"); // Sequelize Model

// verifyToken middleware
exports.verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(403).send("Access Denied: No token provided.");
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    } else {
      return res.status(400).send("Invalid token format.");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { id: decoded.id } });
    if (!user) {
      return res.status(404).send("User not found.");
    }

    req.user = {
      id: user.id,
      role: user.role,
      ...decoded,
    };

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while verifying the token." });
  }
};
