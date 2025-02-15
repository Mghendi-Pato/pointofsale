const {
  Phone,
  User,
  Supplier,
  Location,
  PhoneModel,
  Customer,
} = require("../models");
const { Op, Sequelize } = require("sequelize");

exports.registerPhone = async (req, res) => {
  try {
    const loggedInUser = req.user;
    if (!["admin", "super admin"].includes(loggedInUser.role)) {
      return res.status(403).send("Access Denied");
    }

    // Destructure the incoming data
    const {
      imei,
      modelId,
      buyingPrice: purchasePrice,
      supplyDate: buyDate,
      supplier: supplierId,
      manager: managerId,
      capacity: capacity,
      sellingPrice: sellingPrice,
    } = req.body;

    // Check if all required fields are provided
    if (
      !imei ||
      !modelId ||
      !purchasePrice ||
      !buyDate ||
      !supplierId ||
      !managerId ||
      !capacity ||
      !sellingPrice
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

    // Check if the modelId corresponds to a valid phone model
    const phoneModel = await PhoneModel.findByPk(modelId); // Added check for modelId
    if (!phoneModel) {
      return res.status(404).json({ message: "Phone model not found." });
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
      modelId,
      purchasePrice,
      buyDate,
      supplierId,
      managerId,
      capacity,
      sellingPrice,
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
//Edit phone
exports.editPhone = async (req, res) => {
  try {
    const loggedInUser = req.user;

    // Check if the user has sufficient permissions
    if (!["admin", "super admin"].includes(loggedInUser.role)) {
      return res.status(403).send("Access Denied");
    }

    const { id } = req.params;

    const {
      imei,
      model,
      purchasePrice,
      supplyDate: buyDate,
      supplier: supplierId,
      managerId: managerId,
      capacity: capacity,
      sellingPrice: sellingPrice,
    } = req.body;

    // Check if the phone exists
    const phone = await Phone.findByPk(id);
    if (!phone) {
      return res.status(404).json({ message: "Phone not found." });
    }

    // Check if a manager is being updated and verify the manager exists
    if (managerId) {
      const manager = await User.findOne({
        where: { id: managerId, role: "manager" },
      });
      if (!manager) {
        return res.status(404).json({ message: "Manager not found." });
      }
    }

    // Check if a supplier is being updated and verify the supplier exists
    if (supplierId) {
      const supplier = await Supplier.findByPk(supplierId);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found." });
      }
    }

    // Check if IMEI is being updated and ensure it’s unique
    if (imei && imei !== phone.imei) {
      const existingPhone = await Phone.findOne({ where: { imei } });
      if (existingPhone) {
        return res
          .status(400)
          .json({ message: "Phone with this IMEI already exists." });
      }
    }

    // Check if the modelId exists
    if (model) {
      const phoneModel = await PhoneModel.findByPk(model); // Check if modelId exists
      if (!phoneModel) {
        return res.status(404).json({ message: "Phone model not found." });
      }
    }

    // Update the phone
    await phone.update({
      imei: imei || phone.imei,
      modelId: model || phone.modelId,
      purchasePrice: purchasePrice || phone.purchasePrice,
      buyDate: buyDate || phone.buyDate,
      supplierId: supplierId || phone.supplierId,
      managerId: managerId || phone.managerId,
      capacity: capacity || phone.capacity,
      sellingPrice: sellingPrice || phone.sellingPrice,
    });

    return res.status(200).json({
      message: "Phone updated successfully.",
      phone,
    });
  } catch (error) {
    console.error("Error editing phone:", error);
    res.status(500).json({
      message: "An error occurred while editing the phone.",
    });
  }
};
//Fetch phones
const fetchPhones = async (status, page, limit, user) => {
  const whereClause = {
    ...(status && { status }),
    ...(user.role === "manager" && { managerId: user.id }),
  };
  const offset = (page - 1) * limit;
  const { count, rows: phones } = await Phone.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Supplier,
        as: "supplier",
        attributes: ["name", "id"],
        paranoid: false,
      },
      {
        model: User,
        as: "manager",
        attributes: ["firstName", "lastName", "regionId", "id"],
        include: [
          {
            model: Location,
            as: "region",
            attributes: ["name", "location", "id"],
          },
        ],
        paranoid: false,
      },
      {
        model: PhoneModel,
        as: "phoneModel",
        attributes: ["model", "make", "id", "commissions"],
        paranoid: false,
      },
    ],
    offset,
    limit,
  });

  const phonesWithDetails = phones.map((phone) => {
    const {
      id,
      imei,
      modelId,
      purchasePrice,
      buyDate,
      status,
      supplier,
      manager,
      phoneModel,
      createdAt,
      capacity,
      sellingPrice,
    } = phone.toJSON();

    const supplierName = supplier ? supplier.name : "No supplier assigned";
    const supplierId = supplier ? supplier.id : "No supplier assigned";
    const managerId = manager ? manager.id : "No manager assigned";
    const regionId = manager ? manager.regionId : "No region assigned";
    const managerName = manager
      ? `${manager.firstName} ${manager.lastName}`
      : "No manager assigned";
    const managerLocation = manager?.region
      ? `${manager.region.location}`
      : "No location assigned";

    const modelName = phoneModel ? phoneModel.model : "No model assigned";
    const modelMake = phoneModel ? phoneModel.make : "No make assigned";

    let managerCommission = null;
    if (phoneModel && phoneModel.commissions) {
      const commission = phoneModel.commissions.find(
        (comm) => String(comm.regionId) === String(regionId)
      );
      if (commission) {
        managerCommission = commission.amount;
      }
    }

    return {
      id,
      imei,
      modelId,
      modelName,
      modelMake,
      purchasePrice,
      buyDate,
      status,
      supplierName,
      managerName,
      managerLocation,
      createdAt,
      managerId,
      supplierId,
      capacity,
      regionId,
      sellingPrice,
      managerCommission,
    };
  });

  return { count, phones: phonesWithDetails };
};
// Fetch active phones
exports.getActivePhones = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
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

    // Pass req.user to fetchPhones to handle role-based filtering
    const { count, phones } = await fetchPhones(
      "active",
      parsedPage,
      parsedLimit,
      req.user
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
    const { page = 1, limit = 20 } = req.query;
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
// Fetch lost phones
exports.getLostPhones = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
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
      parsedLimit,
      req.user
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
//Declare lost
exports.declareLost = async (req, res) => {
  try {
    const loggedInUser = req.user;

    // Check if the user has sufficient permissions
    if (!["admin", "super admin"].includes(loggedInUser.role)) {
      return res.status(403).json({ message: "Access Denied" });
    }

    const { id } = req.params;

    // Check if the phone exists
    const phone = await Phone.findByPk(id);
    if (!phone) {
      return res.status(404).json({ message: "Phone not found." });
    }

    // Toggle status: if "lost" → set to "active", else → set to "lost"
    const newStatus = phone.status === "lost" ? "active" : "lost";

    // Update the phone status
    await phone.update({ status: newStatus });

    return res.status(200).json({
      message: `Phone status updated to ${newStatus} successfully.`,
      phone,
    });
  } catch (error) {
    console.error("Error toggling phone status:", error);
    res.status(500).json({
      message: "An error occurred while updating the phone status.",
    });
  }
};
// Sell phone
exports.sellPhone = async (req, res) => {
  try {
    const {
      phoneId,
      company,
      firstName,
      middleName,
      lastName,
      phoneNumber,
      ID,
      nkPhone,
      nkFirstName,
      nkLastName,
      agentCommission,
    } = req.body;

    // Step 1: Check if the phone exists and is active
    const phone = await Phone.findByPk(phoneId);
    if (!phone) {
      return res.status(404).json({ message: "Phone not found." });
    }
    if (phone.status !== "active") {
      return res
        .status(400)
        .json({ message: "Phone is not available for sale." });
    }

    let customer;

    // Step 2: Check if customer exists based on unique customerId
    if (ID) {
      customer = await Customer.findOne({ where: { ID } });
    }

    // Step 3: If customer does not exist, create a new customer
    if (!customer) {
      customer = await Customer.create({
        firstName,
        lastName,
        middleName,
        phoneNumber,
        ID,
        nkPhone,
        nkFirstName,
        nkLastName,
      });
    }

    // Step 4: Link phone to the customer
    await phone.update({
      customerId: customer.id,
      company,
      status: "sold",
      saleDate: new Date(),
      agentCommission,
    });

    return res.status(200).json({
      message: "Phone sold successfully.",
      phone,
      customer,
    });
  } catch (error) {
    console.error("Error selling phone:", error);
    res.status(500).json({
      message: "An error occurred while selling the phone.",
    });
  }
};
//Fetch sold phones
const fetchSoldPhones = async (status, company, startDate, endDate, user) => {
  const whereClause = {
    ...(status && { status }),
    ...(user.role === "manager" && { managerId: user.id }),
    ...(company !== "combined" && { company }),
  };

  if (startDate && endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    whereClause.saleDate = {
      [Op.between]: [start, end],
    };
  }

  const { count, rows: phones } = await Phone.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Supplier,
        as: "supplier",
        attributes: ["name", "id"],
        paranoid: false,
      },
      {
        model: User,
        as: "manager",
        attributes: ["firstName", "lastName", "regionId", "id"],
        include: [
          {
            model: Location,
            as: "region",
            attributes: ["name", "location", "id"],
          },
        ],
        paranoid: false,
      },
      {
        model: PhoneModel,
        as: "phoneModel",
        attributes: ["model", "make", "id"],
        paranoid: false,
      },
    ],
  });

  const phonesWithDetails = phones.map((phone) => {
    const {
      id,
      imei,
      modelId,
      purchasePrice,
      agentCommission,
      buyDate,
      status,
      supplier,
      manager,
      phoneModel,
      createdAt,
      capacity,
      sellingPrice,
      company,
      saleDate,
      reconcileDate,
    } = phone.toJSON();

    const supplierName = supplier ? supplier.name : "No supplier assigned";
    const supplierId = supplier ? supplier.id : "No supplier assigned";
    const managerId = manager ? manager.id : "No manager assigned";
    const regionId = manager ? manager.regionId : "No region assigned";
    const managerName = manager
      ? `${manager.firstName} ${manager.lastName}`
      : "No manager assigned";
    const managerLocation = manager?.region
      ? `${manager.region.location}`
      : "No location assigned";

    const modelName = phoneModel ? phoneModel.model : "No model assigned";
    const modelMake = phoneModel ? phoneModel.make : "No make assigned";

    return {
      id,
      imei,
      modelId,
      modelName,
      modelMake,
      purchasePrice,
      buyDate,
      status,
      supplierName,
      managerName,
      managerLocation,
      createdAt,
      managerId,
      supplierId,
      capacity,
      regionId,
      sellingPrice,
      agentCommission,
      company,
      saleDate,
      reconcileDate,
    };
  });

  return { count, phones: phonesWithDetails };
};
//Get sold phones
exports.getSoldPhones = async (req, res) => {
  try {
    const { status, company, startDate, endDate } = req.query;

    // Pass req.user for role-based filtering
    const { count, phones } = await fetchSoldPhones(
      status,
      company,
      startDate,
      endDate,
      req.user
    );

    if (!status) {
      return res.status(400).json({ error: "Status is required." });
    }

    if (phones.length === 0) {
      return res.status(200).json({
        message: "No sold phones found.",
        phones: [],
        total: 0,
      });
    }

    res.status(200).json({
      message: "Sold phones fetched successfully.",
      phones,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//Get sales comparisons for dashboard
exports.getSalesComparison = async (req, res) => {
  try {
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

    const soldPhones = await Phone.findAll({
      where: {
        status: { [Op.in]: ["sold", "reconcile"] },
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

    const soldThisMonth = soldPhones.filter(
      (phone) => phone.saleDate >= firstDayOfThisMonth
    );
    const soldLastMonth = soldPhones.filter(
      (phone) =>
        phone.saleDate >= firstDayOfLastMonth &&
        phone.saleDate <= lastDayOfLastMonth
    );

    const calculateTotalsAndPercentage = (thisMonthPhones, lastMonthPhones) => {
      const totalIncomeThisMonth = thisMonthPhones.reduce(
        (sum, phone) => sum + (phone.sellingPrice || 0),
        0
      );
      const totalIncomeLastMonth = lastMonthPhones.reduce(
        (sum, phone) => sum + (phone.sellingPrice || 0),
        0
      );
      const totalCommissionThisMonth = thisMonthPhones.reduce(
        (sum, phone) => sum + (phone.agentCommission || 0),
        0
      );
      const totalCommissionLastMonth = lastMonthPhones.reduce(
        (sum, phone) => sum + (phone.agentCommission || 0),
        0
      );
      const totalProfitThisMonth =
        totalIncomeThisMonth - totalCommissionThisMonth;
      const totalProfitLastMonth =
        totalIncomeLastMonth - totalCommissionLastMonth;

      const calculatePercentageChange = (thisMonthValue, lastMonthValue) => {
        if (lastMonthValue === 0) return thisMonthValue > 0 ? "+100%" : "0%";
        const change =
          ((thisMonthValue - lastMonthValue) / lastMonthValue) * 100;
        return change > 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
      };

      return {
        total: thisMonthPhones.length,
        totalIncome: totalIncomeThisMonth,
        totalCommission: totalCommissionThisMonth,
        totalProfit: totalProfitThisMonth,
        percentagePhonesSold: calculatePercentageChange(
          thisMonthPhones.length,
          lastMonthPhones.length
        ),
        percentageIncome: calculatePercentageChange(
          totalIncomeThisMonth,
          totalIncomeLastMonth
        ),
        percentageCommission: calculatePercentageChange(
          totalCommissionThisMonth,
          totalCommissionLastMonth
        ),
        percentageProfit: calculatePercentageChange(
          totalProfitThisMonth,
          totalProfitLastMonth
        ),
      };
    };

    const comparisonData = {
      soldThisMonth: calculateTotalsAndPercentage(soldThisMonth, soldLastMonth),
    };

    const managerIncomeMap = {};
    soldThisMonth.forEach((phone) => {
      if (phone.managerId) {
        managerIncomeMap[phone.managerId] =
          (managerIncomeMap[phone.managerId] || 0) + (phone.sellingPrice || 0);
      }
    });

    const topManagers = Object.entries(managerIncomeMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const managerIds = topManagers.map(([managerId]) => managerId);
    const managers = await User.findAll({
      where: { id: managerIds },
      include: { model: Location, as: "region", attributes: ["location"] },
      attributes: ["id", "firstName", "lastName", "regionId"],
    });

    const topManagersData = managers.map((manager) => ({
      name: `${manager.firstName} ${manager.lastName}`,
      region: manager.region ? manager.region.location : "Unknown",
      totalIncome: managerIncomeMap[manager.id] || 0,
    }));

    const regionSalesMap = {};
    soldThisMonth.forEach((phone) => {
      if (phone.manager && phone.manager.region) {
        const regionName = phone.manager.region.location;
        regionSalesMap[regionName] =
          (regionSalesMap[regionName] || 0) + (phone.sellingPrice || 0);
      }
    });

    const regionSales = Object.entries(regionSalesMap).map(
      ([region, sales]) => ({
        region,
        sales,
      })
    );

    // Compute daily sales comparison
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();
    const dailySales = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      Shuhari: 0,
      Muchami: 0,
    }));

    soldThisMonth.forEach((phone) => {
      const saleDay = new Date(phone.saleDate).getDate();
      const companyName = phone.company.toLowerCase();

      if (companyName === "shuhari") {
        dailySales[saleDay - 1].Shuhari += phone.sellingPrice || 0;
      } else if (companyName === "muchami") {
        dailySales[saleDay - 1].Muchami += phone.sellingPrice || 0;
      }
    });

    res.status(200).json({
      message: "Sales data fetched successfully.",
      ...comparisonData,
      topManagers: topManagersData,
      regionSales,
      dailySales,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const fetchPhonesByPartialIMEI = async (imei) => {
  try {
    const phones = await Phone.findAll({
      where: {
        imei: {
          [Op.like]: `%${imei}%`,
        },
      },
      include: [
        {
          model: PhoneModel,
          as: "phoneModel",
          attributes: ["model"],
        },
        {
          model: Supplier,
          as: "supplier",
          attributes: ["name"],
        },
        {
          model: User,
          as: "manager",
          include: [
            {
              model: Location,
              as: "region",
              attributes: ["name", "location"],
            },
          ],
          attributes: ["firstName", "lastName", "phone"],
        },
        {
          model: Customer,
          as: "customer",
          attributes: [
            "firstName",
            "lastName",
            "middleName",
            "phoneNumber",
            "ID",
            "nkFirstName",
            "nkLastName",
            "nkPhone",
          ],
        },
      ],
    });
    return phones;
  } catch (error) {
    throw new Error("Failed to fetch phones from the database.");
  }
};
exports.searchPhonesByIMEI = async (req, res) => {
  try {
    const { imei } = req.params;
    if (!imei) {
      return res.status(400).json({ error: "IMEI is required." });
    }
    // Fetch phones with IMEIs that partially match the search term
    const phones = await fetchPhonesByPartialIMEI(imei);
    if (phones.length === 0) {
      return res.status(404).json({ message: "No matching phones found." });
    }
    res.status(200).json({
      message: "Phones fetched successfully.",
      phones,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const fetchReconciledPhones = async (status, company, startDate, endDate) => {
  const whereClause = {
    ...(status && { status: "reconcile" }),
    ...(company !== "combined" && { company }),
  };
  if (startDate && endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    whereClause.saleDate = {
      [Op.between]: [start, end],
    };
  }

  const { count, rows: phones } = await Phone.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Supplier,
        as: "supplier",
        attributes: ["name", "id"],
        paranoid: false,
      },
      {
        model: User,
        as: "manager",
        attributes: ["firstName", "lastName", "regionId", "id"],
        include: [
          {
            model: Location,
            as: "region",
            attributes: ["name", "location", "id"],
          },
        ],
        paranoid: false,
      },
      {
        model: PhoneModel,
        as: "phoneModel",
        attributes: ["model", "make", "id"],
        paranoid: false,
      },
    ],
  });

  const phonesWithDetails = phones.map((phone) => {
    const {
      id,
      imei,
      modelId,
      purchasePrice,
      agentCommission,
      buyDate,
      status,
      supplier,
      manager,
      phoneModel,
      createdAt,
      capacity,
      sellingPrice,
      company,
      saleDate,
      reconcileDate,
    } = phone.toJSON();

    const supplierName = supplier ? supplier.name : "No supplier assigned";
    const supplierId = supplier ? supplier.id : "No supplier assigned";
    const managerId = manager ? manager.id : "No manager assigned";
    const regionId = manager ? manager.regionId : "No region assigned";
    const managerName = manager
      ? `${manager.firstName} ${manager.lastName}`
      : "No manager assigned";
    const managerLocation = manager?.region
      ? `${manager.region.location}`
      : "No location assigned";

    const modelName = phoneModel ? phoneModel.model : "No model assigned";
    const modelMake = phoneModel ? phoneModel.make : "No make assigned";

    return {
      id,
      imei,
      modelId,
      modelName,
      modelMake,
      purchasePrice,
      buyDate,
      status,
      supplierName,
      managerName,
      managerLocation,
      createdAt,
      managerId,
      supplierId,
      capacity,
      regionId,
      sellingPrice,
      agentCommission,
      company,
      reconcileDate,
      saleDate,
    };
  });

  return { count, phones: phonesWithDetails };
};
//Get sold phones
exports.getReconciledPhones = async (req, res) => {
  try {
    const { company, startDate, endDate } = req.query;

    // Pass req.user for role-based filtering
    const { count, phones } = await fetchReconciledPhones(
      "reconcile",
      company,
      startDate,
      endDate,
      req.user
    );

    if (phones.length === 0) {
      return res.status(200).json({
        message: "No reconciled phones found.",
        phones: [],
        total: 0,
      });
    }

    res.status(200).json({
      message: "Reconciled phones fetched successfully.",
      phones,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.declareReconciled = async (req, res) => {
  try {
    const loggedInUser = req.user;

    // Check if the user has sufficient permissions
    if (!["admin", "super admin"].includes(loggedInUser.role)) {
      return res.status(403).json({ message: "Access Denied" });
    }

    const { id } = req.params;

    // Check if the phone exists
    const phone = await Phone.findByPk(id);
    if (!phone) {
      return res.status(404).json({ message: "Phone not found." });
    }

    // Determine new status and reconcile date
    const isReconcile = phone.status === "sold";
    const newStatus = isReconcile ? "reconcile" : "sold";
    const reconcileDate = isReconcile ? new Date() : null; // Set date only when reconciling

    // Update the phone status and reconcile date
    await phone.update({
      status: newStatus,
      reconcileDate,
    });

    return res.status(200).json({
      message: `Phone status updated to ${newStatus} successfully.`,
      phone,
    });
  } catch (error) {
    console.error("Error updating phone status:", error);
    res.status(500).json({
      message: "An error occurred while updating the phone status.",
    });
  }
};
//Fecth active phones by regions
exports.getActivePhonesByRegion = async (req, res) => {
  try {
    const activePhonesByRegion = await Location.findAll({
      attributes: [
        "name",
        [Sequelize.fn("COUNT", Sequelize.col("users.phones.id")), "phoneCount"],
      ],
      include: [
        {
          model: User,
          as: "users",
          attributes: [],
          include: [
            {
              model: Phone,
              as: "phones",
              attributes: [],
              where: { status: "active" }, // Ensure only active phones are counted
            },
          ],
        },
      ],
      group: ["Location.id"],
      raw: true,
    });

    // Transform result into required format and ensure phone count is a number
    const result = activePhonesByRegion.map((region) => ({
      region: region.name,
      phones: Number(region.phoneCount) || 0, // Convert to number
    }));

    return res.status(200).json({
      message: "Active phones per region fetched successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching active phones per region:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
};
//Revert sale
exports.revertSale = async (req, res) => {
  try {
    const { phoneId } = req.body;

    // Step 1: Check if the phone exists and is sold
    const phone = await Phone.findByPk(phoneId);
    if (!phone) {
      return res.status(404).json({ message: "Phone not found." });
    }
    if (phone.status !== "sold") {
      return res.status(400).json({ message: "Phone is not marked as sold." });
    }

    // Step 2: Update the phone status back to active and remove customer linkage
    await phone.update({
      customerId: null, // Unlink the customer
      company: null, // Reset company field if needed
      status: "active",
      saleDate: null, // Remove sale date
      agentCommission: null, // Reset agent commission
    });

    return res.status(200).json({
      message: "Phone sale successfully reverted.",
      phone,
    });
  } catch (error) {
    console.error("Error reverting phone sale:", error);
    res.status(500).json({
      message: "An error occurred while reverting the phone sale.",
    });
  }
};
//Delete phone
exports.deletePhone = async (req, res) => {
  try {
    const loggedInUser = req.user;
    if (!["admin", "super admin"].includes(loggedInUser.role)) {
      return res.status(403).send("Access Denied");
    }

    const { imei } = req.params;

    console.log(imei);

    // Check if the phone exists
    const phone = await Phone.findOne({ where: { imei } });
    if (!phone) {
      return res.status(404).json({ message: "Phone not found." });
    }

    // Remove associations (delink before deletion)
    await phone.update({
      supplierId: null,
      managerId: null,
      customerId: null,
      stockId: null,
      modelId: null,
    });

    // Hard delete the phone
    await Phone.destroy({ where: { imei } });

    return res.status(200).json({ message: "Phone deleted successfully." });
  } catch (error) {
    console.error("Error deleting phone:", error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the phone." });
  }
};
