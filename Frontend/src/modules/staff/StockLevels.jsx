import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search } from "lucide-react";

const StockLevel = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [categoriesRes, itemsRes] = await Promise.all([
          axios.get("http://localhost:3000/api/inventory/categories"),
          axios.get("http://localhost:3000/api/inventory/items")
        ]);
        setCategories(categoriesRes.data);
        setItems(itemsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : "N/A";
  };

  const getStockStatus = (quantity, minStockLevel) => {
    if (quantity <= 0) return "Out of Stock";
    if (quantity <= minStockLevel) return "Low Stock";
    return "In Stock";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Out of Stock": return "bg-red-100 text-red-800";
      case "Low Stock": return "bg-yellow-100 text-yellow-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header with fixed height */}
      <div className="p-2 bg-white border-b">
        <h1 className="text-lg font-bold mb-2">Stock Levels</h1>
        
        <div className="flex flex-col space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              className="w-full pl-8 pr-2 py-1 text-sm border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-1 text-sm border rounded"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats cards with fixed height */}
      <div className="grid grid-cols-3 gap-1 p-2 bg-gray-50">
        <StatCard 
          title="Total" 
          value={items.length} 
          className="bg-blue-50 text-blue-800"
        />
        <StatCard 
          title="Low" 
          value={items.filter(i => i.quantity > 0 && i.quantity <= i.minStockLevel).length}
          className="bg-yellow-50 text-yellow-800"
        />
        <StatCard 
          title="Out" 
          value={items.filter(i => i.quantity <= 0).length}
          className="bg-red-50 text-red-800"
        />
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500 text-sm">No items found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredItems.map((item) => {
              const status = getStockStatus(item.quantity, item.minStockLevel);
              const statusColor = getStatusColor(status);
              
              return (
                <div key={item._id} className="bg-white p-2 border rounded text-sm">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium truncate flex-1 mr-2">{item.name}</h3>
                    <span className={`px-1.5 py-0.5 text-xs rounded-full ${statusColor} shrink-0`}>
                      {status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 text-xs">
                    <div className="truncate">
                      <span className="text-gray-500">Category: </span>
                      <span>{getCategoryName(item.category)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Qty: </span>
                      <span>{item.quantity}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Min: </span>
                      <span>{item.minStockLevel}</span>
                    </div>
                    <div className="truncate">
                      <span className="text-gray-500">Location: </span>
                      <span>{item.location || '-'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, className }) => (
  <div className={`${className} p-1 rounded text-center`}>
    <p className="text-xs font-medium truncate">{title}</p>
    <p className="text-base font-bold">{value}</p>
  </div>
);

export default StockLevel;