import React, { useState, useEffect } from "react";
import axios from "axios";
import { PlusCircle, Edit2, Trash, Search, Filter } from "lucide-react";

const InventoryConfig = () => {
  const [activeTab, setActiveTab] = useState("categories");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    quantity: 0,
    minStockLevel: 0,
    location: "",
    source: "Main Campus",
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [originalItem, setOriginalItem] = useState(null);

  const API_BASE_URL = "http://localhost:3000";

  // Fetch categories and items from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/inventory/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchItems = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/inventory/items`);
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchCategories();
    fetchItems();
  }, []);

  // Add a new category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      alert("Category name cannot be empty!");
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/api/inventory/categories`, { name: newCategory });
      setCategories([...categories, response.data]);
      setNewCategory("");
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  // Edit a category
  const handleEditCategory = async (categoryId, newName) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/inventory/categories/${categoryId}`, { name: newName });
      setCategories(categories.map(cat => 
        cat._id === categoryId ? response.data : cat
      ));
      setEditingCategory(null);
    } catch (error) {
      console.error("Error editing category:", error);
    }
  };

  // Delete a category
  const handleDeleteCategory = async (categoryId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/inventory/categories/${categoryId}`);
      setCategories(categories.filter(cat => cat._id !== categoryId));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // Add a new item
  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category) return;
    try {
      const response = await axios.post(`${API_BASE_URL}/api/inventory/items`, newItem);
      setItems([...items, response.data]);
      setNewItem({
        name: "",
        category: "",
        quantity: 0,
        minStockLevel: 0,
        location: "",
        source: "Main Campus",
      });
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  // Edit an item
  const handleEditItem = async (itemId, updatedItem) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/inventory/items/${itemId}`, updatedItem);
      setItems(items.map(item =>
        item._id === itemId ? response.data : item
      ));
      setEditingItem(null);
      setOriginalItem(null);
    } catch (error) {
      console.error("Error editing item:", error);
    }
  };

  // Delete an item
  const handleDeleteItem = async (itemId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/inventory/items/${itemId}`);
      setItems(items.filter(item => item._id !== itemId));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // Enter edit mode for an item
  const handleEditMode = (item) => {
    setEditingItem(item._id);
    setOriginalItem({ ...item });
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingItem(null);
    setOriginalItem(null);
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setActiveTab("categories")}
              className={`${
                activeTab === "categories"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab("items")}
              className={`${
                activeTab === "items"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Items
            </button>
          </nav>
        </div>
      </div>

      {activeTab === "categories" ? (
        // Categories Content
        <div className="flex-1 flex flex-col">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search categories..."
                className="w-full rounded-md border-gray-300 pl-10 pr-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Enter category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="border p-2 rounded-md w-full sm:w-auto"
              />
              <button
                onClick={handleAddCategory}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Category
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow flex-1 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items Count
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {editingCategory === cat._id ? (
                          <input
                            type="text"
                            defaultValue={cat.name}
                            onBlur={(e) => handleEditCategory(cat._id, e.target.value)}
                            className="border p-1 rounded"
                          />
                        ) : (
                          cat.name
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {items.filter(item => item.category === cat._id).length} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setEditingCategory(cat._id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        // Items Content
        <div className="flex-1 flex flex-col">
          {/* Add Item Form */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="text"
              placeholder="Item Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="border p-2 rounded-md w-full sm:w-1/5"
            />
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="border p-2 rounded-md w-full sm:w-1/5"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              className="border p-2 rounded-md w-full sm:w-1/5"
            />
            <input
              type="number"
              placeholder="Min Stock Level"
              value={newItem.minStockLevel}
              onChange={(e) => setNewItem({ ...newItem, minStockLevel: e.target.value })}
              className="border p-2 rounded-md w-full sm:w-1/5"
            />
            <input
              type="text"
              placeholder="Location"
              value={newItem.location}
              onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
              className="border p-2 rounded-md w-full sm:w-1/5"
            />
            <select
              value={newItem.source}
              onChange={(e) => setNewItem({ ...newItem, source: e.target.value })}
              className="border p-2 rounded-md w-full sm:w-1/5"
            >
              <option value="Main Campus">Main Campus</option>
              <option value="Local Purchase">Local Purchase</option>
            </select>
            <button
              onClick={handleAddItem}
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center justify-center"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Item
            </button>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-lg shadow flex-1 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Min Stock Level
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {editingItem === item._id ? (
                          <input
                            type="text"
                            defaultValue={item.name}
                            onBlur={(e) =>
                              handleEditItem(item._id, { ...item, name: e.target.value })
                            }
                            className="border p-1 rounded"
                          />
                        ) : (
                          item.name
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingItem === item._id ? (
                          <select
                            defaultValue={item.category}
                            onBlur={(e) =>
                              handleEditItem(item._id, { ...item, category: e.target.value })
                            }
                            className="border p-1 rounded"
                          >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                              <option key={category._id} value={category._id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          categories.find((cat) => cat._id === item.category)?.name || "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingItem === item._id ? (
                          <input
                            type="number"
                            defaultValue={item.quantity}
                            onBlur={(e) =>
                              handleEditItem(item._id, { ...item, quantity: e.target.value })
                            }
                            className="border p-1 rounded"
                          />
                        ) : (
                          item.quantity
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingItem === item._id ? (
                          <input
                            type="number"
                            defaultValue={item.minStockLevel}
                            onBlur={(e) =>
                              handleEditItem(item._id, { ...item, minStockLevel: e.target.value })
                            }
                            className="border p-1 rounded"
                          />
                        ) : (
                          item.minStockLevel
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingItem === item._id ? (
                          <input
                            type="text"
                            defaultValue={item.location}
                            onBlur={(e) =>
                              handleEditItem(item._id, { ...item, location: e.target.value })
                            }
                            className="border p-1 rounded"
                          />
                        ) : (
                          item.location
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingItem === item._id ? (
                          <select
                            defaultValue={item.source}
                            onBlur={(e) =>
                              handleEditItem(item._id, { ...item, source: e.target.value })
                            }
                            className="border p-1 rounded"
                          >
                            <option value="Main Campus">Main Campus</option>
                            <option value="Local Purchase">Local Purchase</option>
                          </select>
                        ) : (
                          item.source
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingItem === item._id ? (
                          <>
                            <button
                              onClick={() => handleEditItem(item._id, item)}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-red-600 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditMode(item)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div> 
  );
};

export default InventoryConfig;