import { Inventory } from '../models/Inventory.js';

// Fetch all stock levels
export const getStockLevels = async (req, res) => {
  try {
    const stockLevels = await Inventory.find({}).select('itemName category quantity minStockLevel');
    const stockLevelsWithStatus = stockLevels.map(item => ({
      ...item._doc,
      isLowStock: item.isLowStock(),
    }));
    res.status(200).json(stockLevelsWithStatus);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stock levels', error: err.message });
  }
};

// Fetch low stock items
export const getLowStockItems = async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({}).select('itemName category quantity minStockLevel');
    const filteredLowStockItems = lowStockItems.filter(item => item.isLowStock());
    res.status(200).json(filteredLowStockItems);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching low stock items', error: err.message });
  }
};