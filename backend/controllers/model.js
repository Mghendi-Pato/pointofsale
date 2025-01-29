const { PhoneModel } = require("../models");
const { Op } = require("sequelize");

// Create a new Phone Model
exports.createPhoneModel = async (req, res) => {
  try {
    const loggedInUser = req.user;

    if (!["admin", "super admin"].includes(loggedInUser.role)) {
      return res.status(403).send("Access Denied");
    }
    const { make, model } = req.body;

    // Validate request data
    if (!make || !model) {
      return res.status(400).json({ message: "Make and Model are required." });
    }

    const existingModel = await PhoneModel.findOne({ where: { model } });

    if (existingModel) {
      return res.status(409).json({ message: "Phone model already exists." });
    }

    // Create the PhoneModel
    const newPhoneModel = await PhoneModel.create({ make, model });

    return res.status(201).json({
      message: "Phone model created successfully.",
      data: newPhoneModel,
    });
  } catch (error) {
    console.error("Error creating phone model:", error);
    return res.status(500).json({
      message: "An error occurred while creating the phone model.",
      error: error.message,
    });
  }
};

// Get all Phone Models
exports.getAllPhoneModels = async (req, res) => {
  try {
    const loggedInUser = req.user;

    if (!["admin", "super admin"].includes(loggedInUser.role)) {
      return res.status(403).send("Access Denied");
    }

    // Fetch all phone models
    const phoneModels = await PhoneModel.findAll({
      attributes: [
        "id",
        "make",
        "model",
        "createdAt",
        "updatedAt",
        "commissions",
      ],
    });

    return res.status(200).json({
      message: "Phone models retrieved successfully.",
      models: phoneModels,
    });
  } catch (error) {
    console.error("Error fetching phone models:", error);
    return res.status(500).json({
      message: "An error occurred while fetching the phone models.",
      error: error.message,
    });
  }
};
//Edit model

exports.editPhoneModel = async (req, res) => {
  try {
    const loggedInUser = req.user;

    // Check if the user has the right role
    if (!["admin", "super admin"].includes(loggedInUser.role)) {
      return res.status(403).send("Access Denied");
    }

    const commissionsData = req.body;

    // Validate request data
    if (!Array.isArray(commissionsData) || commissionsData.length === 0) {
      return res
        .status(400)
        .json({ message: "Array of commissions is required." });
    }

    for (let i = 0; i < commissionsData.length; i++) {
      const { model, regionId, amount } = commissionsData[i];

      if (!model || !regionId || amount === undefined) {
        return res.status(400).json({
          message:
            "Each commission must have model, regionId, and commission amount.",
        });
      }

      // Fetch phone model from DB
      const phoneModel = await PhoneModel.findOne({ where: { id: model } });

      if (!phoneModel) {
        return res
          .status(404)
          .json({ message: `Phone model with id ${model} not found.` });
      }

      // **Ensure commissions is parsed correctly**
      let commissions = phoneModel.commissions;

      if (!Array.isArray(commissions)) {
        try {
          commissions = JSON.parse(commissions); // In case it's a JSON string
        } catch (error) {
          commissions = []; // If parsing fails, default to an empty array
        }
      }

      console.log("Parsed Commissions:", commissions); // Debugging to verify commissions structure

      // Find existing commission index
      const existingCommissionIndex = commissions.findIndex(
        (commission) => commission.regionId === regionId
      );

      if (existingCommissionIndex !== -1) {
        // Update existing commission
        commissions[existingCommissionIndex].amount = amount;
      } else {
        // Add new commission
        commissions.push({ regionId, amount });
      }

      // Update in database
      phoneModel.commissions = commissions;
      phoneModel.changed("commissions", true);
      await phoneModel.save();
    }

    return res.status(200).json({
      message: "Commission details updated/added successfully.",
    });
  } catch (error) {
    console.error("Error updating commission:", error);
    return res.status(500).json({
      message: "An error occurred while updating the commission.",
      error: error.message,
    });
  }
};
