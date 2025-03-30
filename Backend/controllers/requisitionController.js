import { Requisition } from "../models/Requisition.js";
import { Item } from "../models/Item.js";

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
export const approveRequisition = async (req, res) => {
  try {
    const requisition = await Requisition.findById(req.params.id);
    
    if (!requisition) {
      return res.status(404).json({
        success: false,
        message: "Requisition not found"
      });
    }

    // Update stock for each item
    for (const item of requisition.items) {
      await Item.findByIdAndUpdate(item.item, {
        $inc: { quantity: -item.quantity }
      });
    }

    // Update requisition status
    requisition.status = "Approved";
    requisition.approvedBy = req.user.userId;  // Changed to match your JWT
    await requisition.save();

    return res.json({
      success: true,
      message: "Requisition approved successfully",
      data: requisition
    });

  } catch (error) {
    console.error("Approval error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve requisition",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all requisitions
// @route   GET /api/requisitions
// @access  Private/Admin
export const getRequisitions = async (req, res) => {
  try {
    const requisitions = await Requisition.find()
      .populate('user', 'fullName email role')  // Changed to match your user model
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