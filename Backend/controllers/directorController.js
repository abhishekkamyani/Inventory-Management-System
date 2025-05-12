import { Requisition } from "../models/Requisition.js";
import { User } from "../models/User.js";

// @desc    Get director's personal dashboard statistics
// @route   GET /api/director/stats
// @access  Private/Director
export const getDirectorStats = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    // Get counts only for requisitions created by this director
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
      fulfilled: await Requisition.countDocuments({ 
        status: 'Fulfilled',
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
    console.error('Director stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch director stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get director's recent personal requisitions
// @route   GET /api/director/recent
// @access  Private/Director
export const getDirectorRecentRequisitions = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    // Only get requisitions created by this director
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
    console.error('Director recent requisitions error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch recent requisitions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// @desc    Get director's requisition history with filters
// @route   GET /api/director/requisitions
// @access  Private/Director
// @desc    Get director's requisition history with filters
// @route   GET /api/director/requisitions
// @access  Private/Director
export const getDirectorRequisitions = async (req, res) => {
    try {
      // Check authentication
      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          message: "User authentication required"
        });
      }
  
      const { status, dateRange, search } = req.query;
  
      // Build query - only show requisitions created by this director
      const query = { user: req.user.userId };  // Filter by director's userId
  
      // Add status filter if specified
      if (status && status !== 'all') {
        query.status = status;
      }
  
      // Add date range filter if specified
      if (dateRange && dateRange !== 'all') {
        const now = new Date();
        let startDate = new Date(now);
  
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
        .populate('approvedBy', 'name')
        .populate('fulfilledBy', 'name')
        .lean();
  
      res.json({
        success: true,
        count: requisitions.length,
        data: requisitions
      });
  
    } catch (error) {
      console.error('Director requisitions error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to fetch director requisitions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };