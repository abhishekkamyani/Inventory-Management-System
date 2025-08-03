import React, { useState, useEffect } from 'react';
import { 
  FileText, ChevronDown, ChevronUp, Download, Printer, 
  RefreshCw, XCircle, CheckCircle, Clock, AlertCircle, 
  Search, Trash2, FileEdit
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const RequisitionHistory = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    searchQuery: ''
  });
  const navigate = useNavigate();

  const API_BASE_URL = "http://localhost:3000";

  const fetchRequisitions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.dateRange !== 'all' && { dateRange: filters.dateRange }),
        ...(filters.searchQuery && { search: filters.searchQuery })
      };
  
      const response = await axios.get(`${API_BASE_URL}/api/director/requisitions`, {
        params,
        withCredentials: true
      });
  
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Invalid response format');
      }
  
      setRequisitions(response.data.data || []);
    } catch (err) {
      console.error('Fetch Error:', {
        message: err.message,
        response: err.response?.data,
        config: err.config
      });
      
      const errorMessage = err.response?.data?.error 
        || err.response?.data?.message 
        || err.message 
        || 'Failed to load requisition history';
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, [filters]);

  const handleCancel = async (requisitionId) => {
    if (!window.confirm('Are you sure you want to cancel this requisition?')) return;

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/requisitions/${requisitionId}/cancel`,
        {},
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast.success('Requisition cancelled successfully');
        fetchRequisitions();
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error('Cancel Error:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel requisition');
    }
  };

  const handleResubmit = (requisition) => {
    navigate('/new-requisition', { 
      state: { 
        clonedRequisition: requisition 
      } 
    });
  };

  const handleDownload = (requisition) => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text(`Requisition #${requisition._id.slice(-6).toUpperCase()}`, 14, 20);
    
    // Metadata
    doc.setFontSize(12);
    doc.text(`Status: ${requisition.status}`, 14, 30);
    doc.text(`Date: ${formatDate(requisition.createdAt)}`, 14, 36);
    
    // Items table
    autoTable(doc, {
      head: [['Item', 'Quantity', 'Purpose']],
      body: requisition.items.map(item => [
        item.name,
        item.quantity,
        item.purpose || '-'
      ]),
      startY: 45
    });
    
    // Save PDF
    doc.save(`requisition-${requisition._id.slice(-6)}.pdf`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return <CheckCircle className="text-green-500" size={16} />;
      case 'rejected': return <XCircle className="text-red-500" size={16} />;
      case 'pending': return <Clock className="text-yellow-500" size={16} />;
      case 'fulfilled': return <CheckCircle className="text-blue-500" size={16} />;
      case 'cancelled': return <AlertCircle className="text-gray-500" size={16} />;
      default: return <AlertCircle className="text-gray-500" size={16} />;
    }
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      dateRange: 'all',
      searchQuery: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Requisition History</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search requisitions..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.searchQuery}
              onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
            />
          </div>
          
          {/* Status Filter */}
          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Fulfilled">Fulfilled</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          
          {/* Date Filter */}
          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.dateRange}
            onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
          >
            <option value="all">All Dates</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-8 space-y-3">
          <RefreshCw className="animate-spin text-blue-500" size={24} />
          <p className="text-gray-600">Loading requisitions...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">Error loading requisitions</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <button 
              onClick={fetchRequisitions} 
              className="flex items-center text-blue-600 text-sm"
            >
              <RefreshCw size={16} className="mr-1" /> Retry
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && requisitions.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 text-gray-600 p-8 rounded-lg text-center">
          <FileText className="mx-auto mb-2" size={32} />
          <p className="font-medium">No requisitions found</p>
          <p className="text-sm mt-1">
            {filters.status !== 'all' || filters.dateRange !== 'all' || filters.searchQuery 
              ? "Try adjusting your filters" 
              : "No requisitions available"}
          </p>
          {(filters.status !== 'all' || filters.dateRange !== 'all' || filters.searchQuery) && (
            <button 
              onClick={clearFilters}
              className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Requisitions List */}
      {!loading && !error && requisitions.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requisition ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requisitions.map((requisition) => (
                  <React.Fragment key={requisition._id}>
                    <tr 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === requisition._id ? null : requisition._id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          #{requisition._id.slice(-6).toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(requisition.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {requisition.items.length} {requisition.items.length === 1 ? 'item' : 'items'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(requisition.status)}
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            requisition.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            requisition.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            requisition.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            requisition.status === 'Fulfilled' ? 'bg-blue-100 text-blue-800' :
                            requisition.status === 'Cancelled' ? 'bg-gray-100 text-gray-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {requisition.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2 justify-end">
                          {requisition.status === 'Pending' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancel(requisition._id);
                              }}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                              title="Cancel"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          {requisition.status === 'Rejected' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResubmit(requisition);
                              }}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                              title="Resubmit"
                            >
                              <FileEdit size={16} />
                            </button>
                          )}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(requisition);
                            }}
                            className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50"
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedId(expandedId === requisition._id ? null : requisition._id);
                            }}
                            className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50"
                            title={expandedId === requisition._id ? "Collapse" : "Expand"}
                          >
                            {expandedId === requisition._id ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Details */}
                    {expandedId === requisition._id && (
                      <tr className="bg-gray-50">
                        <td colSpan="5" className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Items List */}
                            <div>
                              <h3 className="font-medium mb-2">Items Requested</h3>
                              <ul className="space-y-3">
                                {requisition.items.map((item, index) => (
                                  <li key={index} className="flex justify-between items-start">
                                    <div>
                                      <span className="font-medium">{item.name}</span>
                                      {item.purpose && (
                                        <p className="text-sm text-gray-600 mt-1">{item.purpose}</p>
                                      )}
                                    </div>
                                    <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-sm">
                                      Qty: {item.quantity}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            {/* Status Information */}
                            <div>
                              <h3 className="font-medium mb-2">Status Timeline</h3>
                              <div className="space-y-3">
                                <div className="flex items-start">
                                  <div className="flex-shrink-0 mt-1">
                                    <CheckCircle className="text-green-500" size={16} />
                                  </div>
                                  <div className="ml-3">
                                    <p className="text-sm font-medium">Submitted</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {formatDate(requisition.createdAt)}
                                    </p>
                                    {requisition.submittedBy && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        By: {requisition.submittedBy.name || 'Director'}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {requisition.status === 'Approved' && requisition.updatedAt && (
                                  <div className="flex items-start">
                                    <div className="flex-shrink-0 mt-1">
                                      <CheckCircle className="text-green-500" size={16} />
                                    </div>
                                    <div className="ml-3">
                                      <p className="text-sm font-medium">Approved</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {formatDate(requisition.updatedAt)}
                                      </p>
                                      {requisition.approvedBy && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          By: {requisition.approvedBy.name || 'Administrator'}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {requisition.status === 'Rejected' && requisition.updatedAt && (
                                  <div className="flex items-start">
                                    <div className="flex-shrink-0 mt-1">
                                      <XCircle className="text-red-500" size={16} />
                                    </div>
                                    <div className="ml-3">
                                      <p className="text-sm font-medium">Rejected</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {formatDate(requisition.updatedAt)}
                                      </p>
                                      {requisition.rejectionReason && (
                                        <div className="mt-1 p-2 bg-red-50 rounded">
                                          <p className="text-xs text-red-700">
                                            <span className="font-medium">Reason:</span> {requisition.rejectionReason}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {requisition.status === 'Fulfilled' && requisition.updatedAt && (
                                  <div className="flex items-start">
                                    <div className="flex-shrink-0 mt-1">
                                      <CheckCircle className="text-blue-500" size={16} />
                                    </div>
                                    <div className="ml-3">
                                      <p className="text-sm font-medium">Fulfilled</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {formatDate(requisition.updatedAt)}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {requisition.status === 'Cancelled' && requisition.updatedAt && (
                                  <div className="flex items-start">
                                    <div className="flex-shrink-0 mt-1">
                                      <AlertCircle className="text-gray-500" size={16} />
                                    </div>
                                    <div className="ml-3">
                                      <p className="text-sm font-medium">Cancelled</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {formatDate(requisition.updatedAt)}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div>
                              <h3 className="font-medium mb-2">Actions</h3>
                              <div className="flex flex-col space-y-2">
                                <button 
                                  onClick={() => handleDownload(requisition)}
                                  className="flex items-center text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50"
                                >
                                  <Download className="mr-2" size={16} />
                                  Download as PDF
                                </button>
                                <button 
                                  onClick={() => window.print()}
                                  className="flex items-center text-gray-600 hover:text-gray-800 p-2 rounded hover:bg-gray-50"
                                >
                                  <Printer className="mr-2" size={16} />
                                  Print Requisition
                                </button>
                                {requisition.status === 'Rejected' && (
                                  <button 
                                    onClick={() => handleResubmit(requisition)}
                                    className="flex items-center text-green-600 hover:text-green-800 p-2 rounded hover:bg-green-50"
                                  >
                                    <FileEdit className="mr-2" size={16} />
                                    Resubmit Request
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequisitionHistory;