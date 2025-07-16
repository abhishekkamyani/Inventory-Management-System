import { Inventory } from "../models/Inventory.js";

import {Category} from "../models/Category.js";
// Get all inventory items
export const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find();
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get inventory item by ID
export const getInventoryById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add a new inventory item
export const addInventory = async (req, res) => {
  const { itemName, category, quantity, location, minStockLevel, qrCode } = req.body;

  try {
    const newItem = new Inventory({
      itemName,
      category,
      quantity,
      location,
      minStockLevel,
      qrCode,
    });

    await newItem.save();
    res.status(201).json({ message: "Inventory item added successfully", item: newItem });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update inventory item
export const updateInventory = async (req, res) => {
  const { itemName, category, quantity, location, minStockLevel, qrCode } = req.body;

  try {
    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      { itemName, category, quantity, location, minStockLevel, qrCode },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    res.status(200).json({ message: "Inventory item updated successfully", item: updatedItem });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete inventory item
export const deleteInventory = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    res.status(200).json({ message: "Inventory item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




// Get inventory stats
export const getInventoryStats = async (req, res) => {
  try {
    const totalItems = await Inventory.countDocuments();
    const lowStockItems = await Inventory.countDocuments({ quantity: { $lte: '$minStockLevel' } });

    res.status(200).json({ totalItems, lowStockItems });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



import { Item } from '../models/Item.js';

export const getLowStockItems = async (req, res) => {
  try {
    // Fetch items where quantity is less than minStockLevel
    const lowStockItems = await Item.find({
      $expr: { $lt: ['$quantity', '$minStockLevel'] },
    })
      .select('name category quantity minStockLevel -_id') // Include only necessary fields
      .limit(10); // Limit to 10 items

    // Format the response to match frontend expectations
    const formattedItems = lowStockItems.map((item) => ({
      name: item.name,
      category: item.category,
      current: item.quantity,
      minimum: item.minStockLevel,
    }));

    res.status(200).json({
      success: true,
      data: formattedItems, // Send formatted data
    });
  } catch (err) {
    console.error('Error fetching low stock items:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message, // Include the error message in the response
    });
  }
};

// Add this to your inventoryController.js
export const getCategoryStats = async (req, res) => {
  try {
    // 1. Get raw counts of items per category (using string IDs)
    const rawCounts = await Item.aggregate([
      { $match: { category: { $exists: true, $ne: "" } } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    // 2. Get all referenced categories (converting string IDs to ObjectId for query)
    const categoryIds = rawCounts.map(item => item._id);
    const categories = await Category.find({ 
      _id: { $in: categoryIds } 
    });

    // 3. Create ID-to-name mapping
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat._id.toString()] = cat.name;
    });

    // 4. Transform results with names
    const results = rawCounts.map(item => ({
      name: categoryMap[item._id] || `Unknown (${item._id})`,
      value: item.count
    }));

    res.status(200).json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Error in getCategoryStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load category stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};