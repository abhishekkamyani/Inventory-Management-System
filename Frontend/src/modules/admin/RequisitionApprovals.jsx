import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CheckCircle,
  XCircle,
  Package,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  X as XIcon,
  Filter,
  Download,
  FilePlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

const dateKey = {
  "Approved": "approvedAt",
  "Rejected": "rejectedAt",
  "Fulfilled": "approvedAt",
}

const RequisitionApprovals = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRequisition, setExpandedRequisition] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [items, setItems] = useState([]);
  const [newRequisition, setNewRequisition] = useState({
    items: [],
    purpose: ''
  });
  const [availableItems, setAvailableItems] = useState([]);
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const navigate = useNavigate();

  // Track window width
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, itemsRes] = await Promise.all([
        axios.get('http://localhost:3000/api/requisitions', { withCredentials: true }),
        axios.get('http://localhost:3000/api/inventory/items', { withCredentials: true })
      ]);
      setRequisitions(Array.isArray(reqRes.data?.data) ? reqRes.data.data : []);
      setAvailableItems(Array.isArray(itemsRes.data) ? itemsRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setRequisitions([]);
      setAvailableItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (requisitionId) => {
    try {
      setLoading(true);
      const response = await axios.patch(
        `http://localhost:3000/api/requisitions/${requisitionId}/approve`,
        {},
        { withCredentials: true }
      );
      if (response.data && response.data.message === "Requisition approved successfully") {
        toast.success("Requisition approved successfully");
      }
      fetchData();
    } catch (err) {
      console.error("Approval error:", err);
      toast.error(err.response?.data?.message || "Failed to approve requisition");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequisition || !rejectionReason.trim()) {
      toast.error("Please provide a valid rejection reason");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.patch(
        `http://localhost:3000/api/requisitions/${selectedRequisition}/reject`,
        { rejectionReason },
        { withCredentials: true }
      );
      if (response.data?.message === "Requisition rejected successfully") {
        fetchData();
        toast.success("Requisition rejected successfully");
        setShowRejectDialog(false);
        setRejectionReason('');
        setSelectedRequisition(null);
      }
    } catch (err) {
      console.error("Rejection error:", err);
      toast.error(err.response?.data?.message || "Failed to reject requisition");
    } finally {
      setLoading(false);
    }
  };

  const handleFulfill = async (requisitionId) => {
    try {
      setLoading(true);
      const response = await axios.patch(
        `http://localhost:3000/api/requisitions/${requisitionId}/fulfill`,
        {},
        { withCredentials: true }
      );
      if (response.data?.message === "Requisition fulfilled successfully") {
        fetchData();
        toast.success("Requisition marked as fulfilled successfully");
      }
    } catch (err) {
      console.error("Fulfillment error:", err);
      toast.error(err.response?.data?.message || "Failed to fulfill requisition");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequisition = async () => {
    try {
      const response = await axios.post(
        'http://localhost:3000/api/requisitions',
        {
          items: newRequisition.items.map(item => ({
            item: item.item,
            quantity: item.quantity,
            purpose: item.purpose
          })),
          purpose: newRequisition.purpose
        },
        { withCredentials: true }
      );
      fetchData();
      setShowCreateModal(false);
      setNewRequisition({
        items: [],
        purpose: ''
      });
    } catch (error) {
      console.error('Error creating requisition:', error);
      alert('Failed to create requisition');
    }
  };

  const addItemToRequisition = (item) => {
    setNewRequisition(prev => ({
      ...prev,
      items: [...prev.items, {
        item: item._id,
        name: item.name,
        quantity: 1,
        purpose: ''
      }]
    }));
    setItemSearchTerm('');
  };

  const updateItemQuantity = (index, quantity) => {
    if (quantity < 1) return;
    setNewRequisition(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index].quantity = quantity;
      return { ...prev, items: updatedItems };
    });
  };

  const updateItemPurpose = (index, purpose) => {
    setNewRequisition(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index].purpose = purpose;
      return { ...prev, items: updatedItems };
    });
  };

  const removeItemFromRequisition = (index) => {
    setNewRequisition(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const filteredRequisitions = Array.isArray(requisitions) ? requisitions.filter(req => {
    const matchesSearch = req.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(req.items) && req.items.some(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const filteredAvailableItems = Array.isArray(availableItems) ? availableItems.filter(item =>
    item.name?.toLowerCase().includes(itemSearchTerm.toLowerCase()) &&
    !newRequisition.items.some(ri => ri.item === item._id)
  ) : [];

  const getStatusBadge = (status) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium flex items-center';
    switch (status) {
      case 'Approved':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            <CheckCircle className="mr-1 h-3 w-3" /> Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            <XCircle className="mr-1 h-3 w-3" /> Rejected
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
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            <Clock className="mr-1 h-3 w-3" /> Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <ToastContainer />
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold">Requisitions Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base"
        >
          <FilePlus className="mr-2 h-4 w-4" /> New Requisition
        </button>
      </div>

      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search requisitions..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          <select
            className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Fulfilled">Fulfilled</option>
          </select>
        </div>
      </div>

      {/* Mobile View - Cards */}
      {windowWidth < 640 ? (
        <div className="space-y-3">
          {filteredRequisitions.length === 0 ? (
            <div className="text-center text-gray-500 py-4">No requisitions found</div>
          ) : (
            filteredRequisitions.map((requisition) => (
              <div key={requisition._id} className="border rounded-lg shadow-sm overflow-hidden">
                <div 
                  className="p-3 flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedRequisition(expandedRequisition === requisition._id ? null : requisition._id)}
                >
                  <div>
                    <div className="font-medium text-sm">{requisition.user?.fullName || 'Unknown User'}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(requisition.createdAt).toLocaleDateString()} • {requisition.items?.length || 0} items
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(requisition.status)}
                    {expandedRequisition === requisition._id ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {expandedRequisition === requisition._id && (
                  <div className="p-3 border-t bg-gray-50">
                    <div className="mb-3">
                      <h4 className="font-medium text-sm mb-2">Items Requested</h4>
                      <div className="space-y-2">
                        {Array.isArray(requisition.items) && requisition.items.map((item, index) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-gray-600">Qty: {item.quantity}</div>
                            <div className="text-gray-600">Purpose: {item.purpose || 'N/A'}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {requisition.rejectionReason && (
                      <div className="mb-3 text-sm">
                        <div className="font-medium">Rejection Reason:</div>
                        <div className="text-gray-600">{requisition.rejectionReason}</div>
                      </div>
                    )}

                    {requisition.status === 'Pending' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequisition(requisition._id);
                            setShowRejectDialog(true);
                          }}
                          className="px-3 py-1 border border-red-600 text-red-600 rounded-md hover:bg-red-50 text-sm"
                        >
                          Reject
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(requisition._id);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Desktop View - Table */
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requester
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequisitions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 sm:px-6 py-4 text-center text-gray-500">
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
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {requisition.user?.fullName || 'Unknown User'}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500">
                              {requisition.user?.role || 'No role'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(requisition.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {requisition.items?.length || 0} items
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(requisition.status)}
                        {requisition.rejectionReason && (
                          <div className="text-xs text-gray-500 mt-1">
                            Reason: {requisition.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {expandedRequisition === requisition._id ? (
                          <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        )}
                      </td>
                    </tr>
                    {expandedRequisition === requisition._id && (
                      <tr>
                        <td colSpan="5" className="px-4 sm:px-6 py-4 bg-gray-50">
                          <div className="mb-4">
                            <h4 className="font-medium mb-2 text-sm sm:text-base">Items Requested</h4>
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead>
                                <tr>
                                  <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Item
                                  </th>
                                  <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Qty
                                  </th>
                                  <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Purpose
                                  </th>
                                  {(requisition.status !== "Pending") && (
                                    <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      {dateKey[requisition.status]}
                                    </th>
                                  )}
                                  {requisition.status === "Fulfilled" && (
                                    <>
                                      <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fulfilled By
                                      </th>
                                      <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fulfilled at
                                      </th>
                                    </>
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {Array.isArray(requisition.items) && requisition.items.map((item, index) => (
                                  <tr key={index}>
                                    <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                      {item.name}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                      {item.quantity}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                      {item.purpose}
                                    </td>
                                    {requisition.status !== "Pending" && (
                                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(requisition?.[dateKey[requisition.status]])?.toLocaleTimeString()}
                                      </td>
                                    )}
                                    {requisition.status === "Fulfilled" && (
                                      <>
                                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                          {requisition?.fulfilledBy?.fullName || 'Unknown User'}
                                        </td>
                                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                          {new Date(requisition?.fulfilledAt)?.toLocaleTimeString()}
                                        </td>
                                      </>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {requisition.status === 'Pending' && (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRequisition(requisition._id);
                                  setShowRejectDialog(true);
                                }}
                                className="px-3 py-1 sm:px-4 sm:py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 text-sm"
                              >
                                Reject
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(requisition._id);
                                }}
                                className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                              >
                                Approve
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Reject Requisition</h3>
                <button
                  onClick={() => {
                    setShowRejectDialog(false);
                    setRejectionReason('');
                    setSelectedRequisition(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for rejection
                </label>
                <textarea
                  className="border rounded-md px-3 py-2 w-full text-sm"
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter the reason for rejecting this requisition..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRejectDialog(false);
                    setRejectionReason('');
                    setSelectedRequisition(null);
                  }}
                  className="px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                  className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md text-white text-sm ${
                    !rejectionReason.trim()
                      ? 'bg-red-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Requisition Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Create New Requisition</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewRequisition({
                      items: [],
                      purpose: ''
                    });
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  General Purpose (optional)
                </label>
                <textarea
                  className="border rounded-md px-3 py-2 w-full text-sm"
                  rows="2"
                  value={newRequisition.purpose}
                  onChange={(e) => setNewRequisition(prev => ({
                    ...prev,
                    purpose: e.target.value
                  }))}
                  placeholder="Enter the general purpose for this requisition..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Items
                </label>
                <div className="relative mb-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search items to add..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={itemSearchTerm}
                    onChange={(e) => setItemSearchTerm(e.target.value)}
                  />
                </div>

                {itemSearchTerm && filteredAvailableItems.length > 0 && (
                  <div className="border rounded-md max-h-40 overflow-y-auto mb-4">
                    {filteredAvailableItems.map(item => (
                      <div
                        key={item._id}
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center text-sm"
                        onClick={() => addItemToRequisition(item)}
                      >
                        <span>{item.name}</span>
                        <span className="text-xs text-gray-500">Stock: {item.current}</span>
                      </div>
                    ))}
                  </div>
                )}

                {newRequisition.items.length > 0 && (
                  <div className="border rounded-md">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Item
                            </th>
                            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Qty
                            </th>
                            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Purpose
                            </th>
                            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {newRequisition.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {item.name}
                              </td>
                              <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateItemQuantity(index, parseInt(e.target.value))}
                                  className="w-16 border rounded px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={item.purpose}
                                  onChange={(e) => updateItemPurpose(index, e.target.value)}
                                  placeholder="Purpose"
                                  className="border rounded px-2 py-1 text-sm w-full"
                                />
                              </td>
                              <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                                <button
                                  onClick={() => removeItemFromRequisition(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <XIcon className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewRequisition({
                      items: [],
                      purpose: ''
                    });
                  }}
                  className="px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRequisition}
                  disabled={newRequisition.items.length === 0}
                  className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md text-white text-sm ${
                    newRequisition.items.length === 0
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Create Requisition
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequisitionApprovals;