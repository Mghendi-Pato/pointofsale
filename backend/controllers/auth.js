const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { Op } = require("sequelize");

// Register a new user
exports.register = async (req, res) => {
  try {
    const { firstName, phone, lastName, email, password, role, ID } = req.body;
    const loggedInUser = req.user;

    // Check if the logged-in user has the appropriate role to register users
    if (!["admin", "super admin"].includes(loggedInUser.role)) {
      return res
        .status(403)
        .send(
          "Access Denied: You must be an admin or super admin to register users."
        );
    }

    // Admin can only register managers
    if (loggedInUser.role === "admin" && role !== "manager") {
      return res
        .status(400)
        .json({ message: "Admin can only register managers" });
    }

    // Check if a user with the same email or ID already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { ID }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res
          .status(400)
          .json({ message: "User with this emil already exists." });
      }
      if (existingUser.ID === ID) {
        return res
          .status(400)
          .json({ message: "User with this ID already exists." });
      }
    }

    // Hash the password and create a new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      ID,
      phone,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // Check if the user's account is suspended
    if (user.status === "suspended") {
      return res
        .status(403)
        .json({ message: "Account suspended, please contact your admin" });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    // Update the last login date
    user.lastLogin = new Date();
    await user.save();

    // Generate a JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Exclude the password field from the response
    const { password: _, ...userWithoutPassword } = user.toJSON();

    // Respond with the token and user details
    res.status(200).json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error in login function:", error); // Log error for debugging
    res.status(500).json({ error: error.message });
  }
};

//Toggle user status
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user by ID
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle the user's status
    user.status = user.status === "active" ? "suspended" : "active";
    await user.save();

    // Respond with the updated user status
    res.status(200).json({
      message: `User status set as ${user.status}.`,
      user: {
        id: user.id,
        status: user.status,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Error in toggleUserStatus:", error); // Log the error
    res.status(500).json({ error: error.message });
  }
};

//Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const loggedInUser = req.user;
    if (!["admin", "super admin"].includes(loggedInUser.role)) {
      return res.status(403).json({
        message:
          "Access Denied: You must be an admin or super admin to delete users.",
      });
    }
    const userToDelete = await User.findByPk(userId);

    if (!userToDelete) {
      return res.status(404).json({ message: "User not found." });
    }
    if (loggedInUser.role === "admin" && userToDelete.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Admin can only delete managers." });
    }
    await userToDelete.destroy();
    res.status(200).json({ message: "User soft-deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
