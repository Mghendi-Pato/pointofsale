const { User } = require("../models");

exports.getAllAdmins = async (req, res) => {
  try {
    const loggedInUser = req.user;
    // Check if the logged-in user is authorized
    if (!["admin", "super admin"].includes(loggedInUser.role)) {
      return res
        .status(403)
        .send("Access Denied: You must be an admin or super admin.");
    }

    // Find all admins who have not been soft-deleted
    const admins = await User.findAll({
      where: {
        role: "admin",
        deletedAt: null, // Only include users who are not soft-deleted
      },
    });

    // Check if no admins are found
    if (!admins.length) {
      return res.status(404).json({ message: "No admins found." });
    }

    // Map admin data and format the name
    const adminsWithName = admins.map((admin) => {
      const { password, firstName, lastName, ...rest } = admin.toJSON();
      return {
        ...rest,
        name: `${firstName} ${lastName}`,
      };
    });

    // Respond with the list of admins
    res.status(200).json({
      message: "Admins fetched successfully.",
      admins: adminsWithName,
    });
  } catch (error) {
    // Handle any unexpected errors
    res.status(500).json({ error: error.message });
  }
};
