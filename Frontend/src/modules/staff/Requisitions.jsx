import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Requisitions = () => {
  const [requisitions, setRequisitions] = useState([]);

  useEffect(() => {
    const fetchRequisitions = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/staff/requisitions', {
          withCredentials: true,
        });
        setRequisitions(response.data);
      } catch (err) {
        console.error('Error fetching requisitions:', err);
      }
    };

    fetchRequisitions();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Requisitions</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Requested</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requisitions.map((req, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{req.itemName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{req.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{req.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(req.dateRequested).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Requisitions;