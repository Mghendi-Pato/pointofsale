const { Pool, User, sequelize } = require("../models");
const { Op } = require("sequelize");

exports.createPool = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      name,
      superManager: superManagerId,
      poolManagers: memberIds = [],
      poolCommission,
    } = req.body;
    const loggedInUser = req.user;

    console.log(req.body);

    // Only super admins can create pools
    if (loggedInUser.role !== "super admin") {
      return res.status(403).json({ message: "Access denied." });
    }

    if (!name) {
      return res.status(400).json({ message: "Pool name is required." });
    }

    const existingPool = await Pool.findOne({ where: { name } });
    if (existingPool) {
      return res
        .status(400)
        .json({ message: "A pool with this name already exists." });
    }

    // Validate super manager
    const superManager = await User.findByPk(superManagerId);
    if (!superManager || superManager.role !== "manager") {
      return res
        .status(400)
        .json({ message: "Invalid super manager ID or role." });
    }

    // Remove superManager from any existing pool (as super manager)
    const poolWithThisSuper = await Pool.findOne({
      where: { superManagerId },
    });
    if (poolWithThisSuper) {
      await poolWithThisSuper.update(
        { superManagerId: null },
        { transaction: t }
      );
    }

    // Remove superManager from any pool where they might be a regular member
    const superManagerPools = await sequelize.models.PoolMembers.findAll({
      where: { managerId: superManagerId },
    });

    if (superManagerPools.length > 0) {
      await sequelize.models.PoolMembers.destroy({
        where: { managerId: superManagerId },
        transaction: t,
      });
    }

    // Filter out the superManager from the memberIds if present
    const filteredMemberIds = memberIds.filter((id) => id !== superManagerId);

    if (filteredMemberIds.length !== memberIds.length) {
      console.log("Removed super manager from members list");
    }

    // Create the new pool first
    const newPool = await Pool.create(
      {
        name,
        superManagerId,
        poolCommission: poolCommission || 0,
        members: filteredMemberIds, // Store filtered member IDs
      },
      { transaction: t }
    );

    // Remove all selected members from their existing pools
    if (filteredMemberIds.length > 0) {
      await sequelize.models.PoolMembers.destroy({
        where: { managerId: { [Op.in]: filteredMemberIds } },
        transaction: t,
      });
    }

    // Add members to the pool if any are provided
    if (filteredMemberIds.length > 0) {
      // Find valid managers
      const validMembers = await User.findAll({
        where: {
          id: { [Op.in]: filteredMemberIds },
          role: "manager",
        },
        transaction: t,
      });

      // Get valid member IDs
      const validMemberIds = validMembers.map((member) => member.id);
      console.log("Valid members being associated:", validMemberIds);

      // Use the association
      await newPool.setPoolMembers(validMembers, { transaction: t });

      // Log members to verify
      const associatedMembers = await newPool.getPoolMembers({
        transaction: t,
      });
      console.log("Associated members count:", associatedMembers.length);
    }

    await t.commit();

    // Fetch the pool with its members for the response
    const createdPool = await Pool.findByPk(newPool.id, {
      include: [
        {
          model: User,
          as: "poolMembers",
          attributes: ["id", "firstName", "lastName"],
          through: { attributes: [] },
        },
        {
          model: User,
          as: "superManager",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    res.status(201).json({
      message: "Pool created successfully.",
      pool: {
        id: newPool.id,
        name: newPool.name,
        superManagerId: newPool.superManagerId,
        poolCommission: newPool.poolCommission,
        memberCount: filteredMemberIds.length,
        members: createdPool.poolMembers,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error("Error creating pool:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPools = async (req, res) => {
  try {
    const pools = await Pool.findAll({
      include: [
        {
          model: User,
          as: "superManager",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "role",
            "commission",
          ],
        },
        {
          model: User,
          as: "poolMembers", // Changed from "members" to match the association
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "role",
            "commission",
          ],
          through: { attributes: [] },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ pools });
  } catch (error) {
    console.error("Error fetching pools:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.editPool = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      name,
      superManager: superManagerId,
      poolManagers: memberIds = [],
      poolCommission,
    } = req.body;
    const loggedInUser = req.user;

    // Only super admins can edit pools
    if (loggedInUser.role !== "super admin") {
      return res.status(403).json({ message: "Access denied." });
    }

    // Find the pool to edit
    const poolToEdit = await Pool.findByPk(id);
    if (!poolToEdit) {
      return res.status(404).json({ message: "Pool not found." });
    }

    // Check if name is being changed and if it's already taken
    if (name && name !== poolToEdit.name) {
      const existingPool = await Pool.findOne({ where: { name } });
      if (existingPool && existingPool.id !== parseInt(id)) {
        return res.status(400).json({
          message: "A pool with this name already exists.",
        });
      }
    }

    // Validate super manager if provided
    if (superManagerId) {
      const superManager = await User.findByPk(superManagerId);
      if (!superManager || superManager.role !== "manager") {
        return res.status(400).json({
          message: "Invalid super manager ID or role.",
        });
      }

      // If super manager is changed, handle the old and new assignments
      if (superManagerId !== poolToEdit.superManagerId) {
        // Remove the new super manager from any existing pool where they are super manager
        const poolWithThisSuper = await Pool.findOne({
          where: {
            superManagerId,
            id: { [Op.ne]: parseInt(id) }, // Not the current pool
          },
        });

        if (poolWithThisSuper) {
          await poolWithThisSuper.update(
            { superManagerId: null },
            { transaction: t }
          );
        }

        // Remove the new super manager from any pool where they might be a regular member
        await sequelize.models.PoolMembers.destroy({
          where: { managerId: superManagerId },
          transaction: t,
        });
      }
    }

    // Filter out the super manager from member IDs if present
    const filteredMemberIds = memberIds.filter((id) => id !== superManagerId);

    if (filteredMemberIds.length !== memberIds.length) {
      console.log("Removed super manager from members list");
    }

    // Update the pool with new values
    const updateData = {};
    if (name) updateData.name = name;
    if (superManagerId) updateData.superManagerId = superManagerId;
    if (poolCommission !== undefined)
      updateData.poolCommission = poolCommission;
    if (filteredMemberIds.length > 0) updateData.members = filteredMemberIds;

    await poolToEdit.update(updateData, { transaction: t });

    // Handle members if they are being updated
    if (memberIds && memberIds.length >= 0) {
      // Get current members to determine changes
      const currentMembers = await poolToEdit.getPoolMembers();
      const currentMemberIds = currentMembers.map((member) => member.id);

      // Determine which members to remove and which to add
      const membersToRemove = currentMemberIds.filter(
        (id) => !filteredMemberIds.includes(id)
      );
      const membersToAdd = filteredMemberIds.filter(
        (id) => !currentMemberIds.includes(id)
      );

      // Remove members that are no longer in the pool
      if (membersToRemove.length > 0) {
        await sequelize.models.PoolMembers.destroy({
          where: {
            poolId: parseInt(id),
            managerId: { [Op.in]: membersToRemove },
          },
          transaction: t,
        });
      }

      // Remove new members from their existing pools
      if (membersToAdd.length > 0) {
        await sequelize.models.PoolMembers.destroy({
          where: { managerId: { [Op.in]: membersToAdd } },
          transaction: t,
        });

        // Find valid managers to add
        const validMembers = await User.findAll({
          where: {
            id: { [Op.in]: membersToAdd },
            role: "manager",
          },
          transaction: t,
        });

        // Add new members to this pool
        for (const member of validMembers) {
          await sequelize.models.PoolMembers.create(
            {
              poolId: parseInt(id),
              managerId: member.id,
            },
            { transaction: t }
          );
        }
      }
    }

    await t.commit();

    // Fetch the updated pool with its members for the response
    const updatedPool = await Pool.findByPk(id, {
      include: [
        {
          model: User,
          as: "poolMembers",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "role",
            "commission",
          ],
          through: { attributes: [] },
        },
        {
          model: User,
          as: "superManager",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "role",
            "commission",
          ],
        },
      ],
    });

    res.status(200).json({
      message: "Pool updated successfully.",
      pool: updatedPool,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error updating pool:", error);
    res.status(500).json({ error: error.message });
  }
};
exports.deletePool = async (req, res) => {
  const t = await sequelize.transaction();

  console.log(req.body);

  try {
    const { id } = req.params;
    const loggedInUser = req.user;

    // Only super admins can delete pools
    if (loggedInUser.role !== "super admin") {
      return res.status(403).json({ message: "Access denied." });
    }

    // Find the pool to delete
    const poolToDelete = await Pool.findByPk(id);
    if (!poolToDelete) {
      return res.status(404).json({ message: "Pool not found." });
    }

    // Get all members of the pool for reference (might be useful in response)
    const poolMembers = await poolToDelete.getPoolMembers();

    // Delete all member associations first (PoolMembers records)
    await sequelize.models.PoolMembers.destroy({
      where: { poolId: parseInt(id) },
      transaction: t,
    });

    // Delete the pool
    await poolToDelete.destroy({ transaction: t });

    await t.commit();

    res.status(200).json({
      message: "Pool deleted successfully.",
      deletedPool: {
        id: poolToDelete.id,
        name: poolToDelete.name,
        memberCount: poolMembers.length,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error("Error deleting pool:", error);
    res.status(500).json({ error: error.message });
  }
};
