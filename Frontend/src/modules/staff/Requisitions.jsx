import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CheckCircle,
  Package,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  User
} from 'lucide-react';
import { toast } from 'react-toastify';

const Requisitions = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRequisition, setExpandedRequisition] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchRequisitions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/requisitions/approved', {
        withCredentials: true
      });
      console.log("----response----", response.data);
      
      // Transform the data to ensure consistent structure
      const safeRequisitions = Array.isArray(response.data?.data) 
        ? response.data.data.map(req => ({
            ...req,
            // Ensure fulfilledBy exists even if not populated
            fulfilledBy: req.fulfilledBy || null
          }))
        : [];
        
      setRequisitions(safeRequisitions);
    } catch (error) {
      console.error('Error fetching requisitions:', error);
      setRequisitions([]);
      toast.error('Failed to load requisitions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const handleFulfill = async (requisitionId) => {
    try {
      setLoading(true);
      const response = await axios.patch(
        `http://localhost:3000/api/requisitions/${requisitionId}/fulfill`,
        {},
        { withCredentials: true }
      );

      if (response.data?.message === "Requisition fulfilled successfully") {
        // setRequisitions(prev =>
        //   prev.map(req =>
        //     req._id === requisitionId 
        //       ? { 
        //           ...req, 
        //           status: 'Fulfilled',
        //           // Don't depend on backend returning fulfilledBy
        //           // Just update the status
        //         } 
        //       : req
        //   )
        // );
        fetchRequisitions();
        toast.success("Requisition marked as fulfilled");
      }
    } catch (err) {
      console.error("Fulfillment error:", err);
      toast.error(err.response?.data?.message || "Failed to fulfill requisition");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium flex items-center';
    switch (status) {
      case 'Approved':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            <CheckCircle className="mr-1 h-3 w-3" /> Approved
          </span>
        );
      case 'Fulfilled':
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            <Package className="mr-1 h-3 w-3" /> Fulfilled
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            {status}
          </span>
        );
    }
  };

  const filteredRequisitions = requisitions.filter(req => {
    // Safe search - handle potential undefined values
    const searchLower = searchTerm.toLowerCase();
    const userMatch = req.user?.fullName?.toLowerCase().includes(searchLower) || false;
    const itemsMatch = Array.isArray(req.items) 
      ? req.items.some(item => item.name?.toLowerCase().includes(searchLower))
      : false;

    const matchesSearch = userMatch || itemsMatch;
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-6">Requisitions</h2>

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search requisitions..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Fulfilled">Fulfilled</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Requester
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequisitions.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No requisitions found
                </td>
              </tr>
            ) : (
              filteredRequisitions.map((requisition) => (
                <React.Fragment key={requisition._id}>
                  <tr
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      setExpandedRequisition(
                        expandedRequisition === requisition._id ? null : requisition._id
                      )
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {requisition.user?.fullName || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {requisition.user?.role || 'No role'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(requisition.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {requisition.items?.length || 0} items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(requisition.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {expandedRequisition === requisition._id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </td>
                  </tr>
                  {expandedRequisition === requisition._id && (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 bg-gray-50">
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Items Requested</h4>
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Item
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Quantity
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Purpose
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Submitted By
                                </th>
                                {requisition.status === "Fulfilled" && (
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fulfilled at
                                  </th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {Array.isArray(requisition.items) && requisition.items.map((item, index) => (
                                <tr key={index}>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {item.name}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {item.quantity}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {item.purpose}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {requisition?.user?.fullName}
                                  </td>
                                  {requisition.status === "Fulfilled"  && (
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(requisition?.fulfilledAt)?.toLocaleTimeString()}
                                      </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex justify-end">
                          {requisition.status === 'Approved' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFulfill(requisition._id);
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                              disabled={loading}
                            >
                              {loading ? 'Processing...' : 'Mark as Fulfilled'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Requisitions;