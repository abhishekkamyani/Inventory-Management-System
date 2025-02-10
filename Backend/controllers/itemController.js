import { Item } from "../models/Item.js";

// Add a new item
export const addItem = async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all items with category details
export const getItems = async (req, res) => {
  try {
    const items = await Item.find().populate("category");
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Edit Item
export const editItem = async (req, res) => {
    try {
      const { id } = req.params;
      const updatedItem = await Item.findByIdAndUpdate(id, req.body, { new: true });
      res.status(200).json(updatedItem);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  // Delete Item
  export const deleteItem = async (req, res) => {
    try {
      const { id } = req.params;
      await Item.findByIdAndDelete(id);
      res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };