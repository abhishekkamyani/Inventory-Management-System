import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle,
  XCircle,
  Package,
  Clock,
  ChevronDown,
  ChevronUp,
  User,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const dateKey = {
  "Approved": "approvedAt",
  "Rejected": "rejectedAt",
  "Fulfilled": "fulfilledAt"
};

export default function Reports() {
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState([moment().startOf('day'), moment().endOf('day')]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [requisitions, setRequisitions] = useState([]);
  const [expandedRequisition, setExpandedRequisition] = useState(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [searchTerm, setSearchTerm] = useState('');

  // Track window width
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const startDate = dateRange[0].toISOString();
      const endDate = dateRange[1].toISOString();
      const status = statusFilter === 'all' ? null : statusFilter;

      const { data } = await axios.get(
        'http://localhost:3000/api/reports/requisitions',
        { params: { startDate, endDate, status }, withCredentials: true }
      );

      setRequisitions(data.data || []);
      toast.success(`Found ${data.data?.length || 0} requisitions`);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to fetch requisitions');
      setRequisitions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportType === 'daily') {
      setDateRange([moment().startOf('day'), moment().endOf('day')]);
    } else if (reportType === 'weekly') {
      setDateRange([moment().startOf('week'), moment().endOf('week')]);
    } else if (reportType === 'monthly') {
      setDateRange([moment().startOf('month'), moment().endOf('month')]);
    }
  }, [reportType]);

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) setDateRange(dates);
  };

  const handleApprove = async (requisitionId) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:3000/api/requisitions/${requisitionId}/approve`, {}, { withCredentials: true });
      toast.success('Requisition approved successfully');
      fetchReportData();
    } catch (error) {
      console.error('Error approving requisition:', error);
      toast.error('Failed to approve requisition');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please enter a rejection reason');
      return;
    }

    try {
      setLoading(true);
      await axios.put(
        `http://localhost:3000/api/requisitions/${selectedRequisition}/reject`, 
        { rejectionReason }, 
        { withCredentials: true }
      );
      toast.success('Requisition rejected successfully');
      setShowRejectDialog(false);
      setRejectionReason('');
      fetchReportData();
    } catch (error) {
      console.error('Error rejecting requisition:', error);
      toast.error('Failed to reject requisition');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const dataForExport = requisitions.map(req => {
      const itemsDetails = req.items.map(item => 
        `${item.name} (Qty: ${item.quantity}, Purpose: ${item.purpose})` +
        (req.status === 'Fulfilled' ? 
          `, Fulfilled At: ${moment(req.fulfilledAt).format('MMM D, YYYY h:mm A')}` +
          `, By: ${req.fulfilledBy?.fullName || 'N/A'}` : 
          '')
      ).join('\n');
  
      return {
        'ID': req._id.slice(-6),
        'Requested By': req.user?.fullName || 'N/A',
        'Requested At': moment(req.createdAt).format('MMM D, YYYY h:mm A'),
        'Status': req.status,
        'Items Details': itemsDetails,
        'Rejection Reason': req.rejectionReason || 'N/A'
      };
    });
  
    const ws = XLSX.utils.json_to_sheet(dataForExport);
    const wscols = [
      { wch: 8 },  // ID
      { wch: 20 }, // Requested By
      { wch: 20 }, // Requested At
      { wch: 12 }, // Status
      { wch: 60 }, // Items Details
      { wch: 30 }  // Rejection Reason
    ];
    ws['!cols'] = wscols;
  
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Requisitions');
  
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(
      new Blob([buf], { type: 'application/octet-stream' }),
      `requisitions_${moment().format('YYYYMMDD_HHmmss')}.xlsx`
    );
  };

  const getBadge = (status) => {
    const base = 'px-2 py-1 rounded-full text-xs flex items-center';
    switch (status) {
      case 'Approved': return <span className={`${base} bg-green-100 text-green-800`}><CheckCircle className="mr-1 h-3 w-3"/>Approved</span>;
      case 'Rejected': return <span className={`${base} bg-red-100 text-red-800`}><XCircle className="mr-1 h-3 w-3"/>Rejected</span>;
      case 'Fulfilled': return <span className={`${base} bg-blue-100 text-blue-800`}><Package className="mr-1 h-3 w-3"/>Fulfilled</span>;
      default: return <span className={`${base} bg-yellow-100 text-yellow-800`}><Clock className="mr-1 h-3 w-3"/>Pending</span>;
    }
  };

  const filteredRequisitions = requisitions.filter(req => {
    const matchesSearch = req.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <ToastContainer />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold flex items-center">
          <FileText className="mr-2 h-5 w-5" /> Requisitions Report
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={exportToExcel}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            <Download className="mr-2 h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {/* Filters - Stacked on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange[0].format('YYYY-MM-DD')}
              onChange={(e) => setDateRange([moment(e.target.value), dateRange[1]])}
              disabled={reportType !== 'custom'}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={dateRange[1].format('YYYY-MM-DD')}
              onChange={(e) => setDateRange([dateRange[0], moment(e.target.value)])}
              disabled={reportType !== 'custom'}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Fulfilled">Fulfilled</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={fetchReportData}
            disabled={loading}
            className={`w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search requisitions..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredRequisitions.length > 0 ? (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Showing {filteredRequisitions.length} records from {dateRange[0].format('MMM D')} to {dateRange[1].format('MMM D, YYYY')}
          </div>

          {/* Mobile View - Cards */}
          {windowWidth < 768 ? (
            <div className="space-y-3">
              {filteredRequisitions.map((req) => (
                <div key={req._id} className="border rounded-lg shadow-sm overflow-hidden">
                  <div 
                    className="p-3 flex justify-between items-center cursor-pointer"
                    onClick={() => setExpandedRequisition(expandedRequisition === req._id ? null : req._id)}
                  >
                    <div>
                      <div className="font-medium text-sm">{req.user?.fullName || 'Unknown User'}</div>
                      <div className="text-xs text-gray-500">
                        ID: {req._id.slice(-6)} • {moment(req.createdAt).format('MMM D')} • {req.items.length} items
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getBadge(req.status)}
                      {expandedRequisition === req._id ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {expandedRequisition === req._id && (
                    <div className="p-3 border-t bg-gray-50">
                      <div className="mb-3">
                        <h5 className="font-medium text-sm mb-2">Request Info</h5>
                        <div className="text-sm space-y-1">
                          <div><strong>Requested At:</strong> {moment(req.createdAt).format('lll')}</div>
                          {req.rejectionReason && (
                            <div><strong>Rejection Reason:</strong> {req.rejectionReason}</div>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <h5 className="font-medium text-sm mb-2">Items</h5>
                        <div className="space-y-2">
                          {req.items.map((item, index) => (
                            <div key={index} className="text-sm border-b pb-2 last:border-b-0">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-gray-600">Qty: {item.quantity}</div>
                              <div className="text-gray-600">Purpose: {item.purpose || 'N/A'}</div>
                              {req.status !== "Pending" && (
                                <div className="text-gray-600">
                                  {req.status} at: {moment(req[dateKey[req.status]]).format('lll')}
                                </div>
                              )}
                              {req.status === "Fulfilled" && (
                                <div className="text-gray-600">
                                  Fulfilled by: {req.fulfilledBy?.fullName || 'Unknown User'}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {req.status === 'Pending' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRequisition(req._id);
                              setShowRejectDialog(true);
                            }}
                            className="px-3 py-1 border border-red-600 text-red-600 rounded-md hover:bg-red-50 text-sm"
                          >
                            Reject
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(req._id);
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
              ))}
            </div>
          ) : (
            /* Desktop View - Table */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequisitions.map((req) => (
                    <React.Fragment key={req._id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-mono">{req._id.slice(-6)}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="flex-shrink-0 h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {req.user?.fullName || 'Unknown User'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {req.user?.role || 'No role'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {req.items.length} items
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getBadge(req.status)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {moment(req.createdAt).format('MMM D, YYYY')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setExpandedRequisition(expandedRequisition === req._id ? null : req._id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {expandedRequisition === req._id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                      {expandedRequisition === req._id && (
                        <tr>
                          <td colSpan="6" className="px-4 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-medium text-sm mb-2">Request Details</h5>
                                <div className="text-sm space-y-1">
                                  <div><strong>Requested At:</strong> {moment(req.createdAt).format('lll')}</div>
                                  {req.rejectionReason && (
                                    <div><strong>Rejection Reason:</strong> {req.rejectionReason}</div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h5 className="font-medium text-sm mb-2">Items</h5>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                      <tr>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                                        {req.status !== "Pending" && (
                                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {req.status === "Approved" ? "Approved At" : 
                                             req.status === "Rejected" ? "Rejected At" : "Fulfilled At"}
                                          </th>
                                        )}
                                        {req.status === "Fulfilled" && (
                                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fulfilled By
                                          </th>
                                        )}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {req.items.map((item, index) => (
                                        <tr key={index}>
                                          <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                                            {item.name}
                                          </td>
                                          <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                                            {item.quantity}
                                          </td>
                                          <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                                            {item.purpose}
                                          </td>
                                          {req.status !== "Pending" && (
                                            <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                                              {moment(req[dateKey[req.status]]).format('lll')}
                                            </td>
                                          )}
                                          {req.status === "Fulfilled" && (
                                            <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                                              {req.fulfilledBy?.fullName || 'Unknown User'}
                                            </td>
                                          )}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                            {req.status === 'Pending' && (
                              <div className="flex justify-end gap-2 mt-4">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRequisition(req._id);
                                    setShowRejectDialog(true);
                                  }}
                                  className="px-3 py-1 border border-red-600 text-red-600 rounded-md hover:bg-red-50 text-sm"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApprove(req._id);
                                  }}
                                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                                >
                                  Approve
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-8 text-gray-500">
          {loading ? null : 'No requisitions found. Generate a report or adjust your filters.'}
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
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for rejection
                </label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter the reason for rejecting this requisition..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRejectDialog(false);
                    setRejectionReason('');
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
    </div>
  );
}