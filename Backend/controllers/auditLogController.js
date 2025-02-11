// controllers/auditLogController.js
// controllers/auditLogController.js
import { User } from '../models/User.js';

// Fetch audit logs for the authenticated user
export const getAuditLogs = async (req, res) => {
  try {
    const userId = req.user._id; // User ID from the decoded token
    const user = await User.findById(userId).select('auditLogs');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user.auditLogs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
};



// Fetch all audit logs (admin only)
export const getAllAuditLogs = async (req, res) => {
  try {
    const users = await User.find().select('auditLogs fullName email'); // Include user details
    const allLogs = users.reduce((acc, user) => {
      user.auditLogs.forEach(log => {
        acc.push({
          user: user.fullName,
          email: user.email,
          ...log.toObject(), // Spread the log details
        });
      });
      return acc;
    }, []);

    res.status(200).json(allLogs);
  } catch (error) {
    console.error('Error fetching all audit logs:', error);
    res.status(500).json({ message: 'Failed to fetch all audit logs' });
  }
};