import { Requisition } from "../models/Requisition.js";
import { Item } from "../models/Item.js";
import mongoose from "mongoose";
// @desc    Create new requisition
// @route   POST /api/requisitions
// @access  Private
export const createRequisition = async (req, res) => {
  try {
    // Verify user exists in request (from your auth middleware)
    if (!req.user?.userId) {  // Changed from req.user.id to req.user.userId to match your JWT
      console.error("No user ID in request");
      return res.status(401).json({ 
        success: false,
        message: "User authentication required" 
      });
    }

    const { items } = req.body;

    // Validate items array exists and is properly formatted
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "Items must be provided as an array"
      });
    }

    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one item is required"
      });
    }

    // Process and validate each item
    const validatedItems = [];
    const validationErrors = [];

    for (const [index, item] of items.entries()) {
      // Check required fields
      if (!item.item || item.quantity == null || !item.purpose) {
        validationErrors.push(`Item ${index + 1}: All fields are required`);
        continue;
      }

      // Validate quantity
      const quantity = Number(item.quantity);
      if (isNaN(quantity)) {
        validationErrors.push(`Item ${index + 1}: Quantity must be a number`);
        continue;
      }
      if (quantity <= 0) {
        validationErrors.push(`Item ${index + 1}: Quantity must be greater than 0`);
        continue;
      }

      // Verify item exists and check stock
      const dbItem = await Item.findById(item.item);
      if (!dbItem) {
        validationErrors.push(`Item ${index + 1}: Item not found`);
        continue;
      }

      if (dbItem.quantity < quantity) {
        validationErrors.push(
          `Item ${index + 1}: Insufficient stock (Available: ${dbItem.quantity}, Requested: ${quantity})`
        );
        continue;
      }

      validatedItems.push({
        item: dbItem._id,
        name: dbItem.name,
        quantity: quantity,
        purpose: item.purpose
      });
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors
      });
    }

    // Create the requisition
    const requisition = await Requisition.create({
      user: req.user.userId,  // Changed to match your JWT's userId field
      items: validatedItems,
      status: "Pending"
    });

    // Return the created requisition with user details
    const result = await Requisition.findById(requisition._id)
      .populate('user', 'fullName email')  // Changed to match your user model
      .lean();

    return res.status(201).json({
      success: true,
      message: "Requisition created successfully",
      data: result
    });

  } catch (error) {
    console.error("Requisition creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Approve requisition
// @route   PUT /api/requisitions/:id/approve
// @access  Private/Admin
// controllers/requisitionController.js
export const approveRequisition = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id; // From the verified token

    const requisition = await Requisition.findById(id);
    
    if (!requisition) {
      return res.status(404).json({ message: "Requisition not found" });
    }

    if (requisition.status !== "Pending") {
      return res.status(400).json({ 
        message: `Requisition is already ${requisition.status}` 
      });
    }

    requisition.status = "Approved";
    requisition.approvedBy = adminId;
    await requisition.save();

    res.status(200).json({ 
      message: "Requisition approved successfully",
      requisition 
    });
  } catch (error) {
    console.error("Error approving requisition:", error);
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
};




export const rejectRequisition = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user._id; // From the verified token

    // Validate rejection reason exists
    if (!rejectionReason || rejectionReason.trim() === '') {
      return res.status(400).json({ 
        message: "Rejection reason is required and cannot be empty" 
      });
    }

    const requisition = await Requisition.findById(id);
    
    if (!requisition) {
      return res.status(404).json({ message: "Requisition not found" });
    }

    // Check if requisition is in a state that can be rejected
    if (requisition.status !== "Pending") {
      return res.status(400).json({ 
        message: `Cannot reject requisition - current status is ${requisition.status}`,
        currentStatus: requisition.status
      });
    }

    // Update requisition with rejection details
    requisition.status = "Rejected";
    requisition.rejectionReason = rejectionReason;
    requisition.rejectedBy = adminId; // Using rejectedBy instead of approvedBy
    requisition.rejectedAt = new Date(); // Track when it was rejected
    await requisition.save();

    res.status(200).json({ 
      message: "Requisition rejected successfully",
      requisition: {
        _id: requisition._id,
        status: requisition.status,
        rejectionReason: requisition.rejectionReason,
        rejectedBy: requisition.rejectedBy,
        rejectedAt: requisition.rejectedAt,
        // Include other relevant fields as needed
      } 
    });
  } catch (error) {
    console.error("Error rejecting requisition:", error);
    res.status(500).json({ 
      message: "Internal server error while rejecting requisition",
      error: error.message 
    });
  }
};





export const fulfillRequisition = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id; // From the verified token

    const requisition = await Requisition.findById(id);
    
    if (!requisition) {
      return res.status(404).json({ message: "Requisition not found" });
    }

    if (requisition.status !== "Approved") {
      return res.status(400).json({ 
        message: `Cannot fulfill requisition - current status is ${requisition.status}` 
      });
    }

    requisition.status = "Fulfilled";
    requisition.fulfilledBy = adminId;
    requisition.fulfilledAt = new Date();
    await requisition.save();

    res.status(200).json({ 
      message: "Requisition fulfilled successfully",
      requisition 
    });
  } catch (error) {
    console.error("Error fulfilling requisition:", error);
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
};

// @desc    Get all requisitions
// @route   GET /api/requisitions
// @access  Private/Admin
export const getRequisitions = async (req, res) => {
  try {
    const requisitions = await Requisition.find({ status: { $ne: 'Cancelled' } }) // Exclude cancelled requisitions
      .populate('user', 'fullName email role')
      .populate('approvedBy', 'fullName')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: requisitions.length,
      data: requisitions
    });

  } catch (error) {
    console.error("Get requisitions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch requisitions",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// @desc    Get faculty dashboard stats
// @route   GET /api/requisitions/stats
// @access  Private
export const getFacultyStats = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    const stats = {
      pending: await Requisition.countDocuments({ 
        status: 'Pending', 
        user: req.user.userId 
      }),
      approved: await Requisition.countDocuments({ 
        status: 'Approved', 
        user: req.user.userId 
      }),
      rejected: await Requisition.countDocuments({ 
        status: 'Rejected', 
        user: req.user.userId 
      }),
      total: await Requisition.countDocuments({ 
        user: req.user.userId 
      })
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Faculty stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch faculty stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get recent faculty requisitions
// @route   GET /api/requisitions/recent
// @access  Private
export const getFacultyRecentRequisitions = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    const recent = await Requisition.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('items.item', 'name')
      .lean();

    res.json({
      success: true,
      count: recent.length,
      data: recent
    });
  } catch (error) {
    console.error('Recent requisitions error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch recent requisitions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};





export const getRequisitionHistory = async (req, res) => {
  try {
    // Check authentication - matches your middleware's user property
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    const { status, dateRange, search } = req.query;
    const userId = req.user.userId; // Using userId from auth middleware

    // Build query with user filter first
    const query = { user: userId };

    // Add status filter if specified
    if (status && status !== 'all') {
      query.status = status;
    }

    // Add date range filter if specified
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date(now); // Create new date object to avoid mutation

      switch (dateRange) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      query.createdAt = { $gte: startDate };
    }

    // Add search filter if specified
    if (search) {
      query['items.name'] = { $regex: search, $options: 'i' };
    }

    // Fetch requisitions with filters
    const requisitions = await Requisition.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('approvedBy', 'name')
      .lean();

    res.json({
      success: true,
      count: requisitions.length,
      data: requisitions
    });

  } catch (error) {
    console.error('Requisition history error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch requisition history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function for date filtering
function getDateFilter(dateRange) {
  const now = new Date();
  switch (dateRange) {
    case 'week': return { $gte: new Date(now.setDate(now.getDate() - 7)) };
    case 'month': return { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
    case 'year': return { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
    default: return null;
  }
}

export const cancelRequisition = async (req, res) => {
  try {
    // Debug the incoming request
    console.log('[DEBUG] Cancel request - full user object:', req.user);
    console.log('[DEBUG] Request params:', req.params);

    // Check authentication - matches your middleware's structure
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { id } = req.params;
    const userId = req.user.userId;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }

    // Find and update the requisition
    const updatedReq = await Requisition.findOneAndUpdate(
      {
        _id: id,
        user: userId,
        status: 'Pending' // Only allow cancel if status is Pending
      },
      { status: 'Cancelled' },
      { new: true }
    );

    if (!updatedReq) {
      console.log('[DEBUG] Cancellation failed - possible reasons:', {
        exists: await Requisition.exists({ _id: id }),
        belongsToUser: await Requisition.exists({ _id: id, user: userId }),
        currentStatus: await Requisition.findOne({ _id: id }).select('status')
      });
      
      return res.status(404).json({
        success: false,
        message: "Requisition not found, not owned by you, or not pending"
      });
    }

    res.json({
      success: true,
      message: "Requisition cancelled successfully",
      data: updatedReq
    });

  } catch (error) {
    console.error('[FULL ERROR] Cancel requisition:', error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel requisition",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};