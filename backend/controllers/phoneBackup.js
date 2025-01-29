const { Phone, User, Supplier, Location } = require("../models");

exports.registerPhone = async (req, res) => {
  try {
    const loggedInUser = req.user;

    if (!["admin", "super admin"].includes(loggedInUser.role)) {
      return res.status(403).send("Access Denied");
    }

    const {
      imei,
      model,
      buyingPrice: purchasePrice,
      supplyDate: buyDate,
      supplier: supplierId,
      manager: managerId,
    } = req.body;

    // Check if all required fields are provided
    if (
      !imei ||
      !model ||
      !purchasePrice ||
      !buyDate ||
      !supplierId ||
      !managerId
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if the manager exists and is a manager
    const manager = await User.findOne({
      where: { id: managerId, role: "manager" },
    });
    if (!manager) {
      return res.status(404).json({ message: "Manager not found." });
    }

    // Check if the supplier exists
    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found." });
    }

    // Check if the phone with the same IMEI already exists
    const existingPhone = await Phone.findOne({ where: { imei } });
    if (existingPhone) {
      return res
        .status(400)
        .json({ message: "Phone with this IMEI already exists." });
    }

    // Create the phone
    const newPhone = await Phone.create({
      imei,
      model,
      purchasePrice,
      buyDate,
      supplierId,
      managerId,
    });

    return res.status(201).json({
      message: "Phone registered successfully.",
      phone: newPhone,
    });
  } catch (error) {
    console.error("Error registering phone:", error);
    res
      .status(500)
      .json({ message: "An error occurred while registering the phone." });
  }
};

const fetchPhones = async (status, page, limit) => {
  const whereClause = {
    ...(status && { status }),
  };

  const offset = (page - 1) * limit;

  const { count, rows: phones } = await Phone.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Supplier,
        as: "supplier",
        attributes: ["name"],
        paranoid: false,
      },
      {
        model: User,
        as: "manager",
        attributes: ["firstName", "lastName", "regionId"],
        include: [
          {
            model: Location,
            as: "region",
            attributes: ["name", "location"],
          },
        ],
        paranoid: false,
      },
    ],
    offset,
    limit,
  });

  const phonesWithDetails = phones.map((phone) => {
    const {
      imei,
      model,
      purchasePrice,
      buyDate,
      status,
      supplier,
      manager,
      createdAt,
    } = phone.toJSON(); // include createdAt here
    const supplierName = supplier ? supplier.name : "No supplier assigned";
    const managerName = manager
      ? `${manager.firstName} ${manager.lastName}`
      : "No manager assigned";
    const managerLocation = manager?.region
      ? `${manager.region.location}`
      : "No location assigned";

    return {
      imei,
      model,
      purchasePrice,
      buyDate,
      status,
      supplierName,
      managerName,
      managerLocation,
      createdAt, // Add createdAt to the returned object
    };
  });

  return { count, phones: phonesWithDetails };
};

// Fetch active phones
exports.getActivePhones = async (req, res) => {
  try {
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

    const { count, phones } = await fetchPhones(
      "active",
      parsedPage,
      parsedLimit
    );

    if (phones.length === 0) {
      return res.status(200).json({
        message: "No active phones found.",
        phones: [],
        page: parsedPage,
        limit: parsedLimit,
        total: 0,
      });
    }

    res.status(200).json({
      message: "Active phones fetched successfully.",
      phones,
      page: parsedPage,
      limit: parsedLimit,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch suspended phones
exports.getSuspendedPhones = async (req, res) => {
  try {
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

    const { count, phones } = await fetchPhones(
      "suspended",
      parsedPage,
      parsedLimit
    );

    if (phones.length === 0) {
      return res.status(200).json({
        message: "No suspended phones found.",
        phones: [],
        page: parsedPage,
        limit: parsedLimit,
        total: 0,
      });
    }

    res.status(200).json({
      message: "Suspended phones fetched successfully.",
      phones,
      page: parsedPage,
      limit: parsedLimit,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch sold phones
exports.getSoldPhones = async (req, res) => {
  try {
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

    const { count, phones } = await fetchPhones(
      "sold",
      parsedPage,
      parsedLimit
    );

    if (phones.length === 0) {
      return res.status(200).json({
        message: "No sold phones found.",
        phones: [],
        page: parsedPage,
        limit: parsedLimit,
        total: 0,
      });
    }

    res.status(200).json({
      message: "Sold phones fetched successfully.",
      phones,
      page: parsedPage,
      limit: parsedLimit,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch lost phones
exports.getLostPhones = async (req, res) => {
  try {
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

    const { count, phones } = await fetchPhones(
      "lost",
      parsedPage,
      parsedLimit
    );

    if (phones.length === 0) {
      return res.status(200).json({
        message: "No lost phones found.",
        phones: [],
        page: parsedPage,
        limit: parsedLimit,
        total: 0,
      });
    }

    res.status(200).json({
      message: "Lost phones fetched successfully.",
      phones,
      page: parsedPage,
      limit: parsedLimit,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
