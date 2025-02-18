import React, { useState } from 'react';

const StockAudit = () => {
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, itemName: 'Printer Paper', category: 'Stationery', action: 'Checked', date: '2023-10-01' },
    { id: 2, itemName: 'Ink Cartridges', category: 'Electronics', action: 'Updated', date: '2023-10-02' },
  ]);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Stock Audit</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {auditLogs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{log.itemName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{log.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{log.action}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{log.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockAudit;