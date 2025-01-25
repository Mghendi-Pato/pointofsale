const { Location } = require("../models");

// Create a new region
exports.createRegion = async (req, res) => {
  try {
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
    // Retrieve all regions from the database
    const regions = await Location.findAll();

    // Check if regions exist
    if (regions.length === 0) {
      return res.status(404).json({
        message: "No regions found.",
      });
    }

    res.status(200).json({
      message: "Regions fetched successfully.",
      regions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while fetching regions.",
    });
  }
};
