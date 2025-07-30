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
    if (!["admin", "super admin", "shop keeper"].includes(loggedInUser.role)) {
      return res.status(403).send("Access Denied");
    }

    // Destructure incoming data
    const {
      imeis,
      modelId,
      buyingPrice: purchasePrice,
      supplyDate: buyDate,
      supplier: supplierId,
      manager: managerId,
      capacity,
      sellingPrice,
      RAM: ram,
    } = req.body;

    // Check if all required fields are provided
    if (
      !imeis ||
      imeis.length === 0 ||
      !modelId ||
      !purchasePrice ||
      !buyDate ||
      !supplierId ||
      !managerId ||
      !capacity ||
      !sellingPrice ||
      !ram
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
    const phoneModel = await PhoneModel.findByPk(modelId);
    if (!phoneModel) {
      return res.status(404).json({ message: "Phone model not found." });
    }

    // Update the phone model to store the RAM value
    await phoneModel.update({ ram });

    let failedIMEIs = [];
    let successfulPhones = [];

    // Get today's date
    const today = new Date();

    // Loop through each IMEI
    for (let imei of imeis) {
      const existingPhone = await Phone.findOne({ where: { imei } });

      if (existingPhone) {
        failedIMEIs.push(imei); // Store failed IMEIs
      } else {
        const newPhone = await Phone.create({
          imei,
          modelId,
          purchasePrice,
          buyDate,
          supplierId,
          managerId,
          capacity,
          ram,
          sellingPrice,
          dateAssigned: today, // ✅ Assign today's date
        });
        successfulPhones.push(newPhone);
      }
    }

    // If some IMEIs failed, return an explicit error message with the failed IMEIs
    if (failedIMEIs.length > 0) {
      return res.status(400).json({
        message: `Phones with IMEIs ${failedIMEIs.join(", ")} already exist.`,
        failedIMEIs,
        successfulPhones,
      });
    }

    return res.status(201).json({
      message: "All phones registered successfully.",
      phones: successfulPhones,
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
      managerId: newManagerId,
      capacity,
      sellingPrice,
      ram,
    } = req.body;

    // Check if the phone exists
    const phone = await Phone.findByPk(id);
    if (!phone) {
      return res.status(404).json({ message: "Phone not found." });
    }

    let updateData = {
      imei: imei || phone.imei,
      modelId: model || phone.modelId,
      purchasePrice: purchasePrice || phone.purchasePrice,
      buyDate: buyDate || phone.buyDate,
      supplierId: supplierId || phone.supplierId,
      managerId: newManagerId || phone.managerId,
      capacity: capacity || phone.capacity,
      sellingPrice: sellingPrice || phone.sellingPrice,
      dateAssigned: phone.dateAssigned,
      ram: ram || phone.ram,
    };

    // Check if a manager is being updated and verify the manager exists
    if (newManagerId && newManagerId !== phone.managerId) {
      const manager = await User.findOne({
        where: { id: newManagerId, role: "manager" },
      });
      if (!manager) {
        return res.status(404).json({ message: "Manager not found." });
      }

      // ✅ If manager is changed, update `dateAssigned` to today
      updateData.dateAssigned = new Date();
    }

    // Check if a supplier is being updated and verify the supplier exists
    if (supplierId && supplierId !== phone.supplierId) {
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
    if (model && model !== phone.modelId) {
      const phoneModel = await PhoneModel.findByPk(model);
      if (!phoneModel) {
        return res.status(404).json({ message: "Phone model not found." });
      }
    }

    // ✅ Update the phone with new data
    await phone.update(updateData);

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
const fetchPhones = async (status, page, limit, user, searchQuery = "") => {
  const whereClause = {
    ...(status && { status }),
    ...(user.role === "manager" && { managerId: user.id }),
  };

  // Only do basic IMEI search on server if provided
  if (searchQuery.trim()) {
    whereClause.imei = { [Op.iLike]: `%${searchQuery.trim()}%` };
  }

  const offset = (page - 1) * limit;

  // Optimized query with minimal server-side processing
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
    // Simple ordering for better performance
    order: [["createdAt", "DESC"]],
    // Use lean queries for better performance
    raw: false,
    nest: true,
  });

  // Simplified mapping - let client handle complex calculations
  const phonesWithDetails = phones.map((phone) => {
    const phoneData = phone.toJSON();
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
      ram,
      sellingPrice,
      dateAssigned,
    } = phoneData;

    // Basic supplier info
    const supplierName = supplier?.name || null;
    const supplierId = supplier?.id || null;

    // Manager information
    const managerId = manager?.id || null;
    const regionId = manager?.regionId || null;
    const managerName = manager
      ? `${manager.firstName} ${manager.lastName}`
      : null;
    const managerLocation = manager?.region?.location || null;

    // Model information
    const modelName = phoneModel?.model || null;
    const modelMake = phoneModel?.make || null;

    // Simplified commission calculation
    let managerCommission = null;
    if (phoneModel?.commissions && regionId) {
      const commission = phoneModel.commissions.find(
        (comm) => String(comm.regionId) === String(regionId)
      );
      managerCommission = commission?.amount || null;
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
      ram,
      regionId,
      sellingPrice,
      managerCommission,
      dateAssigned,
    };
  });

  return { count, phones: phonesWithDetails };
};

// ✅ Optimized active phones endpoint
exports.getActivePhones = async (req, res) => {
  try {
    const { page = 1, limit = 2000, searchQuery = "" } = req.query; // Increased default limit

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

    // Use optimized fetch function
    const { count, phones } = await fetchPhones(
      "active",
      parsedPage,
      parsedLimit,
      req.user,
      searchQuery
    );

    res.status(200).json({
      message: "Active phones fetched successfully.",
      phones,
      page: parsedPage,
      limit: parsedLimit,
      total: count,
    });
  } catch (error) {
    console.error("Error fetching active phones:", error);
    res.status(500).json({
      message: "An error occurred while fetching active phones.",
      error: error.message,
    });
  }
};

// ✅ Optimized lost phones endpoint
exports.getLostPhones = async (req, res) => {
  try {
    const { page = 1, limit = 500, searchQuery = "" } = req.query; // Increased default limit

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
      req.user,
      searchQuery
    );

    res.status(200).json({
      message: "Lost phones fetched successfully.",
      phones,
      page: parsedPage,
      limit: parsedLimit,
      total: count,
    });
  } catch (error) {
    console.error("Error fetching lost phones:", error);
    res.status(500).json({
      message: "An error occurred while fetching lost phones.",
      error: error.message,
    });
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
      rcpNumber,
      drsFullName,
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

    if (!rcpNumber) {
      return res.status(400).json({ message: "RCPT number is required!" });
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
      rcpNumber,
      drsFullName,
    });

    console.log(phone);

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
    ...(status ? { status } : { status: { [Op.in]: ["sold", "reconcile"] } }),
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
      customer,
      manager,
      phoneModel,
      createdAt,
      capacity,
      sellingPrice,
      company,
      saleDate,
      reconcileDate,
      rcpNumber,
      ram,
      drsFullName,
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

    const customerName = customer
      ? `${customer.firstName} ${customer.middleName}  ${customer.lastName}`
      : "No customer assigned";
    const nkName = customer
      ? `${customer.nkFirstName} ${customer.nkLastName}`
      : "No customer assigned";
    const customerID = customer ? customer.ID : "No ID assigned";
    const customerPhn = customer ? customer.phoneNumber : "No phone assigned";
    const nkPhn = customer ? customer.nkPhone : "No phone assigned";

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
      ram,
      customerName,
      customerID,
      customerPhn,
      nkName,
      nkPhn,
      rcpNumber,
      drsFullName,
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
//Fetch customer Information
const fetchCustommerInformation = async (
  status,
  company,
  startDate,
  endDate,
  user
) => {
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
      customer,
      phoneModel,
      createdAt,
      capacity,
      sellingPrice,
      company,
      saleDate,
      reconcileDate,
      ram,
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
    const customerName = customer
      ? `${customer.firstName} ${customer.lastName}`
      : "No customer assigned";
    const nkName = customer
      ? `${customer.nkFirstName} ${customer.nkLastName}`
      : "No customer assigned";
    const customerID = customer ? customer.ID : "No ID assigned";
    const customerPhn = customer ? customer.phoneNumber : "No phone assigned";
    const nkPhn = customer ? customer.nkPhone : "No phone assigned";
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
      customerPhn,
      supplierName,
      managerName,
      nkName,
      customerID,
      customerName,
      managerLocation,
      createdAt,
      managerId,
      supplierId,
      capacity,
      regionId,
      nkPhn,
      sellingPrice,
      agentCommission,
      company,
      saleDate,
      reconcileDate,
      ram,
    };
  });

  return { count, phones: phonesWithDetails };
};
//Get customer information
exports.getCustomerInformation = async (req, res) => {
  try {
    const { status, company, startDate, endDate } = req.query;

    // Pass req.user for role-based filtering
    const { count, phones } = await fetchCustommerInformation(
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
        (sum, phone) =>
          sum + ((phone.sellingPrice || 0) - (phone.purchasePrice || 0)),
        0
      );

      const totalIncomeLastMonth = lastMonthPhones.reduce(
        (sum, phone) =>
          sum + ((phone.sellingPrice || 0) - (phone.purchasePrice || 0)),
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

    const topManagers = Object.entries(managerIncomeMap).sort(
      (a, b) => b[1] - a[1]
    );

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
        "location",
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
      region: region.location,
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

// Bulk IMEI search - optimized for large datasets
exports.bulkSearchPhonesByIMEI = async (req, res) => {
  try {
    const { imeis, chunkSize = 5000 } = req.body;

    // Validate input
    if (!imeis || !Array.isArray(imeis) || imeis.length === 0) {
      return res.status(400).json({
        message: "IMEIs array is required and must not be empty.",
        phones: []
      });
    }

    // Limit maximum batch size to prevent memory issues
    if (imeis.length > 50000) {
      return res.status(400).json({
        message: "Maximum 50,000 IMEIs allowed per request. Consider splitting into smaller batches.",
        phones: []
      });
    }

    // Clean and validate IMEIs
    const cleanImeis = imeis
      .map(imei => String(imei).trim())
      .filter(imei => imei && imei.length > 0);

    if (cleanImeis.length === 0) {
      return res.status(400).json({
        message: "No valid IMEIs provided.",
        phones: []
      });
    }

    console.log(`Processing ${cleanImeis.length} IMEIs in chunks of ${chunkSize}`);

    // Process IMEIs in chunks to avoid memory issues
    const chunks = [];
    for (let i = 0; i < cleanImeis.length; i += chunkSize) {
      chunks.push(cleanImeis.slice(i, i + chunkSize));
    }

    let allPhones = [];
    let processedCount = 0;

    // Process each chunk
    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const chunk = chunks[chunkIndex];
      console.log(`Processing chunk ${chunkIndex + 1}/${chunks.length} with ${chunk.length} IMEIs`);

      try {
        // Query database for this chunk
        const chunkPhones = await Phone.findAll({
          where: {
            imei: {
              [Op.in]: chunk
            }
          },
          include: [
            {
              model: User,
              as: "manager",
              attributes: ["id", "firstName", "lastName", "regionId"],
              include: [
                {
                  model: Location,
                  as: "region",
                  attributes: ["id", "location", "name"]
                }
              ],
              paranoid: false
            },
            {
              model: PhoneModel,
              as: "phoneModel",
              attributes: ["id", "model", "make"],
              paranoid: false
            },
            {
              model: Supplier,
              as: "supplier",
              attributes: ["id", "name"],
              paranoid: false
            },
            {
              model: Customer,
              as: "customer",
              attributes: ["id", "firstName", "lastName", "middleName", "phoneNumber", "ID"],
              required: false
            }
          ],
          order: [['imei', 'ASC']]
        });

        allPhones = allPhones.concat(chunkPhones);
        processedCount += chunk.length;

        // Small delay between chunks to prevent overwhelming the database
        if (chunkIndex < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (chunkError) {
        console.error(`Error processing chunk ${chunkIndex + 1}:`, chunkError);
        // Continue with other chunks even if one fails
      }
    }

    console.log(`Found ${allPhones.length} phones out of ${cleanImeis.length} IMEIs`);

    // Create a map for O(1) lookup performance
    const phoneMap = new Map();

    allPhones.forEach(phone => {
      const phoneData = phone.toJSON();
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
        customer,
        createdAt,
        capacity,
        ram,
        sellingPrice,
        saleDate,
        company,
        agentCommission,
        dateAssigned
      } = phoneData;

      // Build manager information
      const managerInfo = manager ? {
        id: manager.id,
        name: `${manager.firstName} ${manager.lastName}`.trim(),
        firstName: manager.firstName,
        lastName: manager.lastName,
        regionId: manager.regionId,
        region: manager.region ? {
          id: manager.region.id,
          location: manager.region.location,
          name: manager.region.name
        } : null
      } : null;

      // Build customer information
      const customerInfo = customer ? {
        id: customer.id,
        name: `${customer.firstName} ${customer.middleName || ''} ${customer.lastName}`.trim(),
        firstName: customer.firstName,
        lastName: customer.lastName,
        middleName: customer.middleName,
        phoneNumber: customer.phoneNumber,
        ID: customer.ID
      } : null;

      phoneMap.set(imei, {
        id,
        imei,
        modelId,
        purchasePrice,
        buyDate,
        status,
        createdAt,
        capacity,
        ram,
        sellingPrice,
        saleDate,
        company,
        agentCommission,
        dateAssigned,
        supplier: supplier ? {
          id: supplier.id,
          name: supplier.name
        } : null,
        phoneModel: phoneModel ? {
          id: phoneModel.id,
          model: phoneModel.model,
          make: phoneModel.make
        } : null,
        manager: managerInfo,
        customer: customerInfo
      });
    });

    // Build response array maintaining input order
    const results = cleanImeis.map(imei => {
      const phone = phoneMap.get(imei);
      return {
        imei,
        found: !!phone,
        phone: phone || null
      };
    });

    // Calculate statistics
    const stats = {
      total: cleanImeis.length,
      found: allPhones.length,
      notFound: cleanImeis.length - allPhones.length,
      duplicateImeis: imeis.length - cleanImeis.length,
      chunksProcessed: chunks.length,
      chunkSize: chunkSize
    };

    console.log('Bulk IMEI search completed:', stats);

    res.status(200).json({
      message: "Bulk IMEI search completed successfully.",
      results,
      stats,
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error in bulk IMEI search:", error);
    res.status(500).json({
      message: "An error occurred while searching for IMEIs.",
      error: error.message,
      phones: []
    });
  }
};