const { User, Location } = require("../models");

const fetchManagers = async (status, page, limit) => {
  const whereClause = {
    role: "manager",
    deletedAt: null,
    ...(status && { status }),
  };

  const offset = (page - 1) * limit;

  const { count, rows: managers } = await User.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Location,
        as: "region",
        attributes: ["name", "location"],
      },
    ],
    offset,
    limit,
  });

  const managersWithLocation = managers.map((manager) => {
    const { password, ...managerData } = manager.toJSON();
    const name = `${manager.firstName} ${manager.lastName}`;
    const location = managerData.region
      ? managerData.region.name
      : "No location assigned";
    return { ...managerData, name, location };
  });

  return { count, managers: managersWithLocation };
};

exports.getActiveManagers = async (req, res) => {
  try {
    const loggedInUser = req.user;

    if (!["admin", "super admin"].includes(loggedInUser.role)) {
      return res
        .status(403)
        .send("Access Denied: You must be an admin or super admin.");
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

    const { count, managers } = await fetchManagers(
      "active",
      parsedPage,
      parsedLimit
    );

    // Handle case where no active managers are found
    if (managers.length === 0) {
      return res.status(200).json({
        message: "No active managers found.",
        managers: [],
        page: parsedPage,
        limit: parsedLimit,
        total: 0,
      });
    }

    res.status(200).json({
      message: "Active managers fetched successfully.",
      managers,
      page: parsedPage,
      limit: parsedLimit,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSuspendedManagers = async (req, res) => {
  try {
    const loggedInUser = req.user;

    if (!["admin", "super admin"].includes(loggedInUser.role)) {
      return res
        .status(403)
        .send("Access Denied: You must be an admin or super admin.");
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

    const { count, managers } = await fetchManagers(
      "suspended",
      parsedPage,
      parsedLimit
    );

    // If no managers are found, return an empty array with a success message
    if (managers.length === 0) {
      return res.status(200).json({
        message: "No suspended managers found.",
        managers: [],
        page: parsedPage,
        limit: parsedLimit,
        total: 0,
      });
    }

    res.status(200).json({
      message: "Suspended managers fetched successfully.",
      managers,
      page: parsedPage,
      limit: parsedLimit,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
