import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search } from "lucide-react";

const StockLevel = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = "http://localhost:3000";

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [categoriesRes, itemsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/inventory/categories`),
          axios.get(`${API_BASE_URL}/api/inventory/items`)
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
    <div className="h-full flex flex-col p-2 sm:p-4">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Inventory Stock Levels</h1>
      
      {/* Filters - Stack on mobile, row on larger screens */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
          <input
            type="text"
            placeholder="Search items..."
            className="w-full rounded-md border-gray-300 pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded-md p-2 text-sm sm:text-base"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stock Summary Cards - Single column on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <StatCard 
          title="Total Items" 
          value={items.length} 
          className="bg-blue-50 text-blue-800"
        />
        <StatCard 
          title="Low Stock" 
          value={items.filter(i => i.quantity > 0 && i.quantity <= i.minStockLevel).length}
          className="bg-yellow-50 text-yellow-800"
        />
        <StatCard 
          title="Out of Stock" 
          value={items.filter(i => i.quantity <= 0).length}
          className="bg-red-50 text-red-800"
        />
      </div>

      {/* Items Table - Card layout on mobile, table on desktop */}
      <div className="bg-white rounded-lg shadow flex-1 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Desktop Table Header (hidden on mobile) */}
            <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="col-span-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </div>
              <div className="col-span-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </div>
              <div className="col-span-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Qty
              </div>
              <div className="col-span-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Min
              </div>
              <div className="col-span-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </div>
              <div className="col-span-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </div>
              <div className="col-span-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </div>
            </div>
            
            {/* Table Body */}
            <div className="flex-1 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="flex items-center justify-center h-full p-4">
                  <p className="text-gray-500">No items found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredItems.map((item) => {
                    const status = getStockStatus(item.quantity, item.minStockLevel);
                    const statusColor = getStatusColor(status);
                    
                    return (
                      <div key={item._id} className="p-2 sm:p-0 hover:bg-gray-50">
                        {/* Mobile Item Card */}
                        <div className="sm:hidden p-3 border rounded-lg mb-2">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                              {status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-gray-500">Category</p>
                              <p>{getCategoryName(item.category)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Quantity</p>
                              <p>{item.quantity}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Min Level</p>
                              <p>{item.minStockLevel}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Location</p>
                              <p>{item.location || '-'}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Desktop Table Row */}
                        <div className="hidden sm:grid grid-cols-12 gap-2 items-center px-4 py-3">
                          <div className="col-span-4 text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                          <div className="col-span-2 text-sm text-gray-500">
                            {getCategoryName(item.category)}
                          </div>
                          <div className="col-span-1 text-sm text-gray-500">
                            {item.quantity}
                          </div>
                          <div className="col-span-1 text-sm text-gray-500">
                            {item.minStockLevel}
                          </div>
                          <div className="col-span-1">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                              {status}
                            </span>
                          </div>
                          <div className="col-span-2 text-sm text-gray-500">
                            {item.location || '-'}
                          </div>
                          <div className="col-span-1 text-sm text-gray-500">
                            {item.source}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, className }) => (
  <div className={`${className} p-3 rounded-lg shadow-sm`}>
    <p className="text-sm font-medium">{title}</p>
    <p className="text-xl font-bold">{value}</p>
  </div>
);

export default StockLevel;