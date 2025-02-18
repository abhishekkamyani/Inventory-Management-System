import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StockLevels = () => {
  const [stockLevels, setStockLevels] = useState([]);

  useEffect(() => {
    const fetchStockLevels = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/staff/stock-levels');
        setStockLevels(response.data);
      } catch (err) {
        console.error('Error fetching stock levels:', err);
      }
    };

    fetchStockLevels();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Stock Levels</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Minimum Required</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stockLevels.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.itemName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.minStockLevel}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {item.quantity <= item.minStockLevel ? (
                    <span className="text-red-600">Low Stock</span>
                  ) : (
                    <span className="text-green-600">In Stock</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockLevels;