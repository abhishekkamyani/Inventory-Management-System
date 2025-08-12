import React, { useState, useEffect, useRef } from 'react';
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
  const mobileContainerRef = useRef(null);

  const fetchRequisitions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/requisitions/approved', {
        withCredentials: true
      });
      
      const safeRequisitions = Array.isArray(response.data?.data) 
        ? response.data.data.map(req => ({
            ...req,
            fulfilledBy: req.fulfilledBy || null,
            items: Array.isArray(req.items) ? req.items : []
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

  // Ensure mobile container is scrolled to top when filtering changes
  useEffect(() => {
    if (mobileContainerRef.current) {
      mobileContainerRef.current.scrollTop = 0;
    }
  }, [searchTerm, statusFilter]);

  const handleFulfill = async (requisitionId) => {
    try {
      setLoading(true);
      const response = await axios.patch(
        `http://localhost:3000/api/requisitions/${requisitionId}/fulfill`,
        {},
        { withCredentials: true }
      );

      if (response.data?.message === "Requisition fulfilled successfully") {
        await fetchRequisitions();
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
    const searchLower = searchTerm.toLowerCase();
    const userMatch = req.user?.fullName?.toLowerCase().includes(searchLower) || false;
    const itemsMatch = req.items.some(item => 
      item.name?.toLowerCase().includes(searchLower)
    );

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
    <div className="bg-white p-4 md:p-6 rounded-lg shadow">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Requisitions</h2>

      <div className="mb-4 md:mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search requisitions..."
            className="block w-full pl-9 md:pl-10 pr-3 py-2 text-sm md:text-base border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
          <select
            className="block w-full pl-3 pr-8 py-2 text-sm md:text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Fulfilled">Fulfilled</option>
          </select>
        </div>
      </div>

      {/* Mobile View - Optimized for iPhone XR */}
      <div 
        ref={mobileContainerRef}
        className="md:hidden space-y-3 pb-4"
        style={{ 
          maxHeight: '65vh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth'
        }}
      >
        {filteredRequisitions.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No requisitions found
          </div>
        ) : (
          filteredRequisitions.map((requisition) => (
            <div 
              key={requisition._id} 
              className="border rounded-lg p-3 bg-white"
            >
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() =>
                  setExpandedRequisition(
                    expandedRequisition === requisition._id ? null : requisition._id
                  )
                }
              >
                <div className="min-w-0">
                  <div className="font-medium flex items-center gap-2 truncate">
                    <User className="flex-shrink-0 h-4 w-4 text-gray-400" />
                    <span className="truncate">{requisition.user?.fullName || 'Unknown User'}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1 truncate">
                    {requisition.items?.length || 0} items • {new Date(requisition.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {getStatusBadge(requisition.status)}
                  {expandedRequisition === requisition._id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {expandedRequisition === requisition._id && (
                <div className="mt-3 pt-3 border-t">
                  <h4 className="font-medium mb-2">Items Requested</h4>
                  <div 
                    className="space-y-3 pr-2"
                    style={{ 
                      maxHeight: '40vh',
                      overflowY: 'auto',
                      WebkitOverflowScrolling: 'touch'
                    }}
                  >
                    {requisition.items.map((item, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium truncate">{item.name}</div>
                        <div className="flex justify-between">
                          <span>Quantity:</span>
                          <span className="font-medium">{item.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Purpose:</span>
                          <span className="text-gray-600 truncate max-w-[180px]">{item.purpose}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    {requisition.status === 'Approved' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFulfill(requisition._id);
                        }}
                        className="w-full py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Mark as Fulfilled'}
                      </button>
                    )}

                    {requisition.status === 'Fulfilled' && requisition.fulfilledAt && (
                      <div className="text-xs text-gray-500 text-right">
                        Fulfilled at: {new Date(requisition.fulfilledAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
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
                                {requisition.status === "Fulfilled" && (
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fulfilled at
                                  </th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {requisition.items.map((item, index) => (
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
                                  {requisition.status === "Fulfilled" && (
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                      {new Date(requisition.fulfilledAt).toLocaleString()}
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