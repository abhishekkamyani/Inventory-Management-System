import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileText, ArrowLeft } from 'lucide-react';

const RequisitionDetail = ({ isDirectorView, actions }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requisition, setRequisition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequisition = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/requisitions/${id}`, {
          withCredentials: true
        });
        setRequisition(response.data);
      } catch (err) {
        setError('Failed to load requisition details');
      } finally {
        setLoading(false);
      }
    };
    fetchRequisition();
  }, [id]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (!requisition) return <div className="text-center py-8">Requisition not found</div>;

  // Determine submitter display text
  const submitterDisplay = isDirectorView ? 'Director' : 
                         requisition.submittedBy?.role === 'faculty' ? 'Faculty Member' : 'Staff';

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-start mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="mr-1" size={16} /> Back
        </button>
        <span className={`px-3 py-1 rounded-full text-sm ${
          requisition.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          requisition.status === 'approved' ? 'bg-green-100 text-green-800' :
          requisition.status === 'rejected' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {requisition.status.charAt(0).toUpperCase() + requisition.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FileText className="mr-2" /> Requisition #{requisition._id.slice(-6)}
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Status Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Submitted</p>
                    <p className="text-sm text-gray-500">
                      {new Date(requisition.createdAt).toLocaleString()} <br />
                      By: {submitterDisplay}
                    </p>
                  </div>
                </div>
                {requisition.status === 'approved' && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Approved</p>
                      <p className="text-sm text-gray-500">
                        {new Date(requisition.updatedAt).toLocaleString()} <br />
                        By: Administrator
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Items Requested</h3>
              <div className="border rounded-lg divide-y">
                {requisition.items.map((item, idx) => (
                  <div key={idx} className="p-3">
                    <p className="font-medium">{item.name}</p>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Qty: {item.quantity}</span>
                      <span>Purpose: {item.purpose}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Details</h3>
            <div className="space-y-2">
              <p><span className="text-gray-600">Submitted by:</span> {submitterDisplay}</p>
              <p><span className="text-gray-600">Department:</span> {requisition.department}</p>
              <p><span className="text-gray-600">Date:</span> {new Date(requisition.createdAt).toLocaleDateString()}</p>
              {requisition.remarks && (
                <p><span className="text-gray-600">Remarks:</span> {requisition.remarks}</p>
              )}
            </div>
          </div>

          {actions && actions.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Actions</h3>
              <div className="space-y-2">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequisitionDetail;