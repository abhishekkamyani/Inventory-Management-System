import React, { useState, useEffect } from 'react';
import { Package, Search, RefreshCw } from 'lucide-react';
import axios from 'axios';

const TrackRequisitions = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE_URL = "http://localhost:3000";

  const fetchRequisitions = async () => {
    try {
      setLoading(true);
      const params = { status: 'approved,fulfilled' };
      if (searchQuery) params.search = searchQuery;
      
      const response = await axios.get(`${API_BASE_URL}/api/director/track`, {
        params,
        withCredentials: true
      });
      setRequisitions(response.data.data);
    } catch (err) {
      setError('Failed to load requisitions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, [searchQuery]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Package className="mr-2" /> Track Orders
      </h3>
      
      <div className="mb-4 flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search orders..."
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={fetchRequisitions}
          className="ml-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          title="Refresh"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4">{error}</div>
      ) : requisitions.length === 0 ? (
        <div className="text-gray-500 p-4">No orders to track</div>
      ) : (
        <div className="space-y-4">
          {requisitions.map((req) => (
            <div key={req._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">Requisition #{req._id.slice(-6)}</h4>
                  <p className="text-sm text-gray-600">
                    Submitted: {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: <span className="font-medium text-green-600">
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </p>
                </div>
                {req.processedBy && (
                  <p className="text-sm">Processed by: {req.processedBy.name}</p>
                )}
              </div>
              
              <div className="mt-3">
                <h5 className="text-sm font-medium mb-1">Items:</h5>
                <ul className="space-y-1">
                  {req.items.map((item, idx) => (
                    <li key={idx} className="text-sm">
                      {item.name} - Qty: {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrackRequisitions;