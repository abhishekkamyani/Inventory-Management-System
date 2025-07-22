import { Item } from "../models/Item.js";

// Add a new item controller
export const addItem = async (req, res) => {
  try {
    // Destructure the incoming request body to ensure valid data
    const { name, category, quantity, minStockLevel, location, source } = req.body;

    // Validate required fields
    if (!name || !category || !quantity || !minStockLevel || !location) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Create a new item based on the request body
    const item = new Item({
      name,
      category,
      quantity,
      minStockLevel,
      location,
      source: source || "Main Campus", // Default source if not provided
    });

    // Save the item to the database
    await item.save();

    // Respond with the newly created item
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



  // Get total number of items Controller
export const getTotalItemsCount = async (req, res) => {
  try {
    // Fetch the total number of items from the database
    const totalItemsCount = await Item.countDocuments(); // Example for MongoDB
    res.status(200).json({ totalItemsCount });
  } catch (err) {
    console.error('Error fetching total items count:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};



export const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    next(error); // Pass the error to the global error handler
  }
};

export const updateStockLevels = async (req, res, next) => {
  try {
    const { itemId, quantityReceived, expectedName, expectedCategory } = req.body;
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    if (item.name !== expectedName || item.category !== expectedCategory) {
      return res.status(400).json({ message: 'Item details do not match' });
    }
    item.quantity += quantityReceived;
    await item.save();
    res.json({ message: 'Stock levels updated successfully', item });
  } catch (error) {
    next(error); // Pass the error to the global error handler
  }
};



export const receiveStock = async (req, res, next) => {
  try {
    const { itemId, quantity, expectedName, expectedCategory } = req.body;
    
    // Validate input
    if (!itemId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    const item = await Item.findById(itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Verify item details match expected values
    if (item.name !== expectedName || item.category !== expectedCategory) {
      return res.status(400).json({ message: 'Item details do not match' });
    }
    
    // Update stock by adding the received quantity
    item.quantity += quantity;
    await item.save();
    
    res.json({ 
      message: 'Stock received successfully',
      item,
      action: 'received',
      quantityReceived: quantity
    });
  } catch (error) {
    next(error);
  }
};

export const takeStock = async (req, res, next) => {
  try {
    const { itemId, quantity, expectedName, expectedCategory } = req.body;
    
    // Validate input
    if (!itemId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    const item = await Item.findById(itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Verify item details match expected values
    if (item.name !== expectedName || item.category !== expectedCategory) {
      return res.status(400).json({ message: 'Item details do not match' });
    }
    
    // Check if enough stock is available
    if (item.quantity < quantity) {
      return res.status(400).json({ 
        message: `Insufficient stock. Only ${item.quantity} available`,
        availableQuantity: item.quantity
      });
    }
    
    // Update stock by subtracting the taken quantity
    item.quantity -= quantity;
    await item.save();
    
    res.json({ 
      message: 'Stock taken successfully',
      item,
      action: 'taken',
      quantityTaken: quantity
    });
  } catch (error) {
    next(error);
  }
};