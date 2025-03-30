import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import axios from 'axios';

const TrackRequisitions = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequisitions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/api/faculty/requisitions', {
          params: { status: 'approved,fulfilled', limit: 10 },
          withCredentials: true
        });
        setRequisitions(response.data.requisitions);
      } catch (err) {
        console.error('Error fetching requisitions:', err);
        setError('Failed to load requisitions');
      } finally {
        setLoading(false);
      }
    };
    fetchRequisitions();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Package className="mr-2" /> Track Orders
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="space-y-4">
          {requisitions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active orders to track
            </div>
          ) : (
            requisitions.map((req) => (
              <div key={req._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">Requisition #{req._id.slice(-6)}</h4>
                    <p className="text-sm text-gray-600">
                      Submitted: {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: <span className={`font-medium ${
                        req.status === 'approved' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </p>
                  </div>
                  <div className="text-sm">
                    {req.processedBy && (
                      <p>Processed by: {req.processedBy.name}</p>
                    )}
                  </div>
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
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TrackRequisitions;