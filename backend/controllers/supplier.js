const { Supplier } = require("../models");

// Register a new supplier
exports.registerSupplier = async (req, res) => {
  try {
    const loggedInUser = req.user; // Ensure this is populated by your authentication middleware

    // Check if the user has the required role
    if (!["admin", "super admin"].includes(loggedInUser.role)) {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    const { name, phone } = req.body;

    // Input validation
    if (!name || !phone) {
      return res.status(400).json({
        message: "Name and phone are required.",
      });
    }

    // Check if a supplier with the same phone number already exists
    const existingSupplier = await Supplier.findOne({
      where: { phone },
    });

    if (existingSupplier) {
      return res.status(400).json({
        message: "A supplier with this phone number already exists.",
      });
    }

    // Create the new supplier
    const newSupplier = await Supplier.create({
      name,
      phone,
    });

    res.status(201).json({
      message: "Supplier registered successfully.",
      supplier: newSupplier,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while registering the supplier.",
    });
  }
};

exports.fetchSuppliers = async (req, res) => {
  try {
    const loggedInUser = req.user; // Ensure this is populated by your authentication middleware

    // Check if the user has the required role
    if (!["admin", "super admin"].includes(loggedInUser.role)) {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const suppliers = await Supplier.findAndCountAll({
      where: {
        deletedAt: null,
      },
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Suppliers fetched successfully.",
      suppliers: suppliers.rows,
      totalItems: suppliers.count,
      totalPages: Math.ceil(suppliers.count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while fetching the suppliers.",
    });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const loggedInUser = req.user; // Ensure this is populated by your authentication middleware

    // Check if the user has the required role
    if (!["admin", "super admin"].includes(loggedInUser.role)) {
      return res.status(403).json({
        message: "Access Denied.",
      });
    }

    const { id } = req.params;

    // Find the supplier by ID
    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      return res.status(404).json({
        message: "Supplier not found.",
      });
    }

    // Soft delete the supplier
    await supplier.destroy();

    res.status(200).json({
      message: "Supplier deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while deleting the supplier.",
    });
  }
};
