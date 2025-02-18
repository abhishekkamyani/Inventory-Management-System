import { Requisition } from "../models/Requisition.js";

import { Inventory } from '../models/Inventory.js';


// Get requisition by ID
export const getRequisitionById = async (req, res) => {
  try {
    const requisition = await Requisition.findById(req.params.id).populate("requester item");
    if (!requisition) {
      return res.status(404).json({ message: "Requisition not found" });
    }
    res.status(200).json(requisition);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new requisition
export const createRequisition = async (req, res) => {
  const { requester, item, quantity, remarks } = req.body;

  try {
    const newRequisition = new Requisition({
      requester,
      item,
      quantity,
      remarks,
    });

    await newRequisition.save();
    res.status(201).json({ message: "Requisition created successfully", requisition: newRequisition });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update requisition (e.g., approve/reject)
export const updateRequisition = async (req, res) => {
  const { status } = req.body;

  try {
    const updatedRequisition = await Requisition.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("requester item");

    if (!updatedRequisition) {
      return res.status(404).json({ message: "Requisition not found" });
    }

    res.status(200).json({ message: "Requisition updated successfully", requisition: updatedRequisition });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete requisition
export const deleteRequisition = async (req, res) => {
  try {
    const requisition = await Requisition.findByIdAndDelete(req.params.id);
    if (!requisition) {
      return res.status(404).json({ message: "Requisition not found" });
    }
    res.status(200).json({ message: "Requisition deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get requisition stats
export const getRequisitionStats = async (req, res) => {
    try {
      const pendingRequests = await Requisition.countDocuments({ status: 'Pending' });
  
      res.status(200).json({ pendingRequests });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };




  // Submit a requisition
export const submitRequisition = async (req, res) => {
  const { itemName, quantity } = req.body;

  try {
    // Check if the item exists in the inventory
    const item = await Inventory.findOne({ itemName });
    if (!item) {
      return res.status(404).json({ message: 'Item not found in inventory' });
    }

    // Create a new requisition
    const requisition = new Requisition({
      item: item._id,
      quantity,
      requester: req.user._id, // Assuming the authenticated user is the requester
    });

    await requisition.save();
    res.status(201).json({ message: 'Requisition submitted successfully', requisition });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting requisition', error: err.message });
  }
};

// Fetch all requisitions for the logged-in staff
export const getRequisitions = async (req, res) => {
  try {
    const requisitions = await Requisition.find({ requester: req.user._id })
      .populate('item', 'itemName category')
      .select('item quantity status createdAt');
    res.status(200).json(requisitions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching requisitions', error: err.message });
  }
};