import { Inventory } from "../models/Inventory.js";
import { Requisition } from "../models/Requisition.js";

// Generate inventory report (e.g., low stock items)
export const getInventoryReport = async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({ quantity: { $lte: "$minStockLevel" } });
    res.status(200).json(lowStockItems);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Generate requisition report (e.g., pending requisitions)
export const getRequisitionReport = async (req, res) => {
  try {
    const pendingRequisitions = await Requisition.find({ status: "Pending" }).populate("requester item");
    res.status(200).json(pendingRequisitions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};