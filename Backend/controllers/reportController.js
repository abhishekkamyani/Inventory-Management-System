import { Inventory } from "../models/Inventory.js";
import { Requisition } from "../models/Requisition.js";
import mongoose from "mongoose";
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


export const generateRequisitionReport = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    // Validate date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid start date format"
        });
      }

      if (isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid end date format"
        });
      }

      if (start > end) {
        return res.status(400).json({
          success: false,
          message: "Start date must be before end date"
        });
      }

      // Limit date range to max 1 year
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      if (start < oneYearAgo) {
        return res.status(400).json({
          success: false,
          message: "Date range cannot exceed 1 year"
        });
      }
    }

    // Build query object
    const query = {};

    // Date range filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Status filter
    if (status && status !== 'all') {
      if (!['Pending', 'Approved', 'Rejected', 'Fulfilled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value"
        });
      }
      query.status = status;
    }

    // Execute query with population
    const requisitions = await Requisition.find(query)
      .populate('user', 'fullName email role')
      .populate('submittedBy', 'fullName email')
      .populate('approvedBy', 'fullName')
      .populate('rejectedBy', 'fullName')
      .populate('fulfilledBy', 'fullName')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate summary statistics
    const summary = {
      total: requisitions.length,
      pending: requisitions.filter(r => r.status === 'Pending').length,
      approved: requisitions.filter(r => r.status === 'Approved').length,
      rejected: requisitions.filter(r => r.status === 'Rejected').length,
      fulfilled: requisitions.filter(r => r.status === 'Fulfilled').length,
      totalItems: requisitions.reduce((sum, req) => {
        return sum + req.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
      }, 0)
    };

    res.status(200).json({
      success: true,
      count: requisitions.length,
      summary,
      data: requisitions
    });

  } catch (error) {
    console.error('[REPORT ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Failed to generate requisition report",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};