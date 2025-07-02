const { Supplier, Phone } = require("../models");
const { Op } = require("sequelize");

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
    const loggedInUser = req.user;

    if (!["admin", "super admin", "shop keeper"].includes(loggedInUser.role)) {
      return res.status(403).json({ message: "Access Denied" });
    }

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const now = new Date();
    const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const lastDayOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59
    );

    const suppliers = await Supplier.findAndCountAll({
      where: { deletedAt: null },
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Phone,
          as: "phones",
          attributes: ["id", "purchasePrice", "buyDate"],
        },
      ],
    });

    // Enhance suppliers data with required calculations
    const supplierData = await Promise.all(
      suppliers.rows.map(async (supplier) => {
        const phonesThisMonth = supplier.phones.filter(
          (phone) => phone.buyDate >= firstDayOfThisMonth
        );
        const phonesLastMonth = supplier.phones.filter(
          (phone) =>
            phone.buyDate >= firstDayOfLastMonth &&
            phone.buyDate <= lastDayOfLastMonth
        );

        const totalPhonesThisMonth = phonesThisMonth.length;
        const totalBuyingPriceThisMonth = phonesThisMonth.reduce(
          (sum, phone) => sum + (phone.purchasePrice || 0),
          0
        );
        const totalBuyingPriceLastMonth = phonesLastMonth.reduce(
          (sum, phone) => sum + (phone.purchasePrice || 0),
          0
        );

        const percentageChange =
          totalBuyingPriceLastMonth === 0
            ? totalBuyingPriceThisMonth > 0
              ? "+100%"
              : "0%"
            : `${(
                ((totalBuyingPriceThisMonth - totalBuyingPriceLastMonth) /
                  totalBuyingPriceLastMonth) *
                100
              ).toFixed(2)}%`;

        return {
          id: supplier.id,
          name: supplier.name,
          contact: supplier.phone,
          email: supplier.email,
          totalPhonesThisMonth,
          totalBuyingPriceThisMonth,
          percentageChange,
        };
      })
    );

    res.status(200).json({
      message: "Suppliers fetched successfully.",
      suppliers: supplierData,
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
exports.editSupplier = async (req, res) => {
  try {
    const loggedInUser = req.user; // Ensure this is populated by your authentication middleware

    // Check if the user has the required role
    if (!["admin", "super admin"].includes(loggedInUser.role)) {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    const { id } = req.params;
    const { name, phone } = req.body;

    // Input validation
    if (!name || !phone) {
      return res.status(400).json({
        message: "Name and phone are required.",
      });
    }

    // Find the supplier by ID
    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      return res.status(404).json({
        message: "Supplier not found.",
      });
    }

    // Check if another supplier with the same phone number already exists (excluding current supplier)
    const existingSupplier = await Supplier.findOne({
      where: {
        phone,
        id: { [Op.ne]: id }, // Exclude current supplier from the check
      },
    });

    if (existingSupplier) {
      return res.status(400).json({
        message: "A supplier with this phone number already exists.",
      });
    }

    // Update the supplier
    await supplier.update({
      name,
      phone,
    });

    res.status(200).json({
      message: "Supplier updated successfully.",
      supplier: supplier,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while updating the supplier.",
    });
  }
};
