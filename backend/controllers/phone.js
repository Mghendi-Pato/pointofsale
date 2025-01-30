const {
  Phone,
  User,
  Supplier,
  Location,
  PhoneModel,
  Customer,
} = require("../models");

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
      modelId,
      buyingPrice: purchasePrice,
      supplyDate: buyDate,
      supplier: supplierId,
      manager: managerId,
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
    if (modelId) {
      const phoneModel = await PhoneModel.findByPk(modelId); // Check if modelId exists
      if (!phoneModel) {
        return res.status(404).json({ message: "Phone model not found." });
      }
    }

    // Update the phone
    await phone.update({
      imei: imei || phone.imei,
      modelId: modelId || phone.modelId,
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
// Fetch sold phones
exports.getSoldPhones = async (req, res) => {
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
      lastName,
      phoneNumber,
      ID,
      nkPhone,
      nkFirstName,
      nkLastName,
    } = req.body;

    console.log(phoneId);

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
        phoneNumber,
        ID,
        nkPhone,
        nkFirstName,
        nkLastName,
      });
    }

    // Step 4: Link phone to the customer
    await phone.update({
      customerId: customer.id, // Assuming `customerId` is now a foreign key in the Phone model
      company,
      status: "sold",
      saleDate: new Date(), // Automatically sets date & time
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
