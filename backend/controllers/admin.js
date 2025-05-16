const { Op } = require("sequelize");
const { User } = require("../models");

// Fetch admins based on status, pagination, and role
const fetchAdmins = async (status, page, limit) => {
  const allowedRoles = ["admin", "shop keeper", "collection officer"];
  const whereClause = {
    role: { [Op.in]: allowedRoles },
    deletedAt: null,
    ...(status && { status }),
  };

  const offset = (page - 1) * limit;

  const { count, rows: admins } = await User.findAndCountAll({
    where: whereClause,
    offset,
    limit,
  });

  const adminsWithDetails = admins.map((admin) => {
    const { password, ...adminData } = admin.toJSON();
    const name = `${admin.firstName} ${admin.lastName}`;
    return { ...adminData, name };
  });

  return { count, admins: adminsWithDetails };
};

// Get active admins
exports.getActiveAdmins = async (req, res) => {
  try {
    const loggedInUser = req.user;

    if (!["super admin"].includes(loggedInUser.role)) {
      return res.status(403).send("Access Denied");
    }

    const { page = 1, limit = 10 } = req.query;
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    if (
      isNaN(parsedPage) ||
      isNaN(parsedLimit) ||
      parsedPage <= 0 ||
      parsedLimit <= 0
    ) {
      return res.status(400).json({ message: "Invalid pagination parameters" });
    }

    const { count, admins } = await fetchAdmins(
      "active",
      parsedPage,
      parsedLimit
    );

    // Handle case where no active admins are found
    if (admins.length === 0) {
      return res.status(200).json({
        message: "No active admins found.",
        admins: [],
        page: parsedPage,
        limit: parsedLimit,
        total: 0,
      });
    }

    res.status(200).json({
      message: "Active admins fetched successfully.",
      admins,
      page: parsedPage,
      limit: parsedLimit,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get suspended admins
exports.getSuspendedAdmins = async (req, res) => {
  try {
    const loggedInUser = req.user;

    if (!["super admin"].includes(loggedInUser.role)) {
      return res.status(403).send("Access Denied.");
    }

    const { page = 1, limit = 10 } = req.query;
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    if (
      isNaN(parsedPage) ||
      isNaN(parsedLimit) ||
      parsedPage <= 0 ||
      parsedLimit <= 0
    ) {
      return res.status(400).json({ message: "Invalid pagination parameters" });
    }

    const { count, admins } = await fetchAdmins(
      "suspended",
      parsedPage,
      parsedLimit
    );

    // Handle case where no suspended admins are found
    if (admins.length === 0) {
      return res.status(200).json({
        message: "No suspended admins found.",
        admins: [],
        page: parsedPage,
        limit: parsedLimit,
        total: 0,
      });
    }

    res.status(200).json({
      message: "Suspended admins fetched successfully.",
      admins,
      page: parsedPage,
      limit: parsedLimit,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
