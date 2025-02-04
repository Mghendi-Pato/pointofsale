const { Location, Phone, User } = require("../models");
const { Op } = require("sequelize");

// Create a new region
exports.createRegion = async (req, res) => {
  try {
    const loggedInUser = req.user;

    // Check if the user has admin or super admin privileges
    if (!["admin", "super admin"].includes(loggedInUser.role)) {
      return res.status(403).json({
        message: "Access Denied.",
      });
    }

    const { name, location } = req.body;

    // Input validation
    if (!name || !location) {
      return res.status(400).json({
        message: "Name and location are required.",
      });
    }

    // Check if a region with the same name and location already exists
    const existingRegion = await Location.findOne({
      where: { location },
    });

    if (existingRegion) {
      return res.status(400).json({
        message: "A region with this location already exists.",
      });
    }

    // Create the new region
    const newRegion = await Location.create({
      name,
      location,
    });

    res.status(201).json({
      message: "Region created successfully.",
      region: newRegion,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while creating the region.",
    });
  }
};

// Fetch all regions
exports.fetchRegions = async (req, res) => {
  try {
    const loggedInUser = req.user;

    // Check if the user has admin or super admin privileges
    if (!["admin", "super admin"].includes(loggedInUser.role)) {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

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

    // Retrieve all regions
    const regions = await Location.findAll({
      attributes: ["id", "location"],
    });

    if (regions.length === 0) {
      return res.status(404).json({ message: "No regions found." });
    }

    // Retrieve all sold phones for the last two months
    const soldPhones = await Phone.findAll({
      where: {
        status: "sold",
        saleDate: { [Op.gte]: firstDayOfLastMonth },
      },
      include: {
        model: User,
        as: "manager",
        include: {
          model: Location,
          as: "region",
          attributes: ["id", "location"],
        },
        attributes: ["id", "regionId"],
      },
    });

    // Organize phone sales data by region
    const regionSalesMap = {};

    soldPhones.forEach((phone) => {
      if (phone.manager && phone.manager.region) {
        const regionId = phone.manager.region.id;
        if (!regionSalesMap[regionId]) {
          regionSalesMap[regionId] = {
            totalIncomeThisMonth: 0,
            totalIncomeLastMonth: 0,
            totalPhonesThisMonth: 0,
            totalPhonesLastMonth: 0,
          };
        }

        if (phone.saleDate >= firstDayOfThisMonth) {
          regionSalesMap[regionId].totalIncomeThisMonth +=
            phone.sellingPrice || 0;
          regionSalesMap[regionId].totalPhonesThisMonth += 1;
        } else {
          regionSalesMap[regionId].totalIncomeLastMonth +=
            phone.sellingPrice || 0;
          regionSalesMap[regionId].totalPhonesLastMonth += 1;
        }
      }
    });

    // Compute percentage comparison
    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? "+100%" : "0%";
      const change = ((current - previous) / previous) * 100;
      return change > 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
    };

    // Attach sales data to regions
    const formattedRegions = regions.map((region) => {
      const salesData = regionSalesMap[region.id] || {
        totalIncomeThisMonth: 0,
        totalIncomeLastMonth: 0,
        totalPhonesThisMonth: 0,
        totalPhonesLastMonth: 0,
      };

      return {
        id: region.id,
        location: region.location,
        totalIncome: salesData.totalIncomeThisMonth,
        totalPhonesSold: salesData.totalPhonesThisMonth,
        incomeComparison: calculatePercentageChange(
          salesData.totalIncomeThisMonth,
          salesData.totalIncomeLastMonth
        ),
      };
    });

    res.status(200).json({
      message: "Regions fetched successfully.",
      regions: formattedRegions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while fetching regions.",
    });
  }
};

//Delete region
exports.deleteRegion = async (req, res) => {
  try {
    const loggedInUser = req.user;

    // Check if the user has admin or super admin privileges
    if (!["admin", "super admin"].includes(loggedInUser.role)) {
      return res.status(403).json({
        message: "Access Denied.",
      });
    }

    const { id } = req.params;

    // Check if the region exists
    const region = await Location.findByPk(id);

    if (!region) {
      return res.status(404).json({
        message: "Region not found.",
      });
    }

    // Soft delete the region
    await region.destroy();

    res.status(200).json({
      message: "Region deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while deleting the region.",
    });
  }
};
