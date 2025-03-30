import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RequisitionHistory = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [filters, setFilters] = useState({ status: '', page: 1 });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchRequisitions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/faculty/requisitions', {
        params: filters,
        withCredentials: true
      });
      setRequisitions(response.data.requisitions);
      setPagination({
        page: filters.page,
        total: response.data.total,
        pages: response.data.pages
      });
    } catch (err) {
      console.error('Error fetching requisitions:', err);
      setError('Failed to load requisition history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, status: e.target.value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const viewDetails = (id) => {
    navigate(`/requisitions/${id}`);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <FileText className="mr-2" /> Requisition History
        </h3>
        <select
          value={filters.status}
          onChange={handleFilterChange}
          className="border rounded px-3 py-1"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="fulfilled">Fulfilled</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requisitions.map((req) => (
                  <tr key={req._id}>
                    <td className="px-6 py-4 whitespace-nowrap">#{req._id.slice(-6)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {req.items.length} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        req.status === 'approved' ? 'bg-green-100 text-green-800' :
                        req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => viewDetails(req._id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div>
              Showing page {pagination.page} of {pagination.pages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RequisitionHistory;