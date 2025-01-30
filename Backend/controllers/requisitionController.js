import { Requisition } from "../models/Requisition.js";

// Get all requisitions
export const getRequisitions = async (req, res) => {
  try {
    const requisitions = await Requisition.find().populate("requester item");
    res.status(200).json(requisitions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

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