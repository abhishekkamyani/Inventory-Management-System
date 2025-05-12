import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileText, ArrowLeft } from 'lucide-react';

const RequisitionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requisition, setRequisition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequisition = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/director/requisitions/${id}`, {
          withCredentials: true
        });
        setRequisition(response.data);
      } catch (err) {
        console.error('Error fetching requisition:', err);
        setError('Failed to load requisition details');
      } finally {
        setLoading(false);
      }
    };
    fetchRequisition();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this requisition?')) return;
    
    setCanceling(true);
    setError(null);
    try {
      await axios.put(`/api/director/requisitions/${id}/cancel`, {}, {
        withCredentials: true
      });
      navigate('/requisition-history');
    } catch (err) {
      console.error('Error canceling requisition:', err);
      setError(err.response?.data?.message || 'Failed to cancel requisition');
    } finally {
      setCanceling(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (!requisition) return <div className="text-center py-8">Requisition not found</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft className="mr-1" size={16} /> Back
      </button>

      <div className="flex justify-between items-start mb-6">
        <h3 className="text-lg font-semibold flex items-center">
          <FileText className="mr-2" /> Requisition #{requisition._id.slice(-6)}
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm ${
          requisition.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          requisition.status === 'approved' ? 'bg-green-100 text-green-800' :
          requisition.status === 'rejected' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {requisition.status.charAt(0).toUpperCase() + requisition.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="font-medium mb-2">Details</h4>
          <div className="space-y-2">
            <p><span className="text-gray-600">Submitted:</span> {new Date(requisition.createdAt).toLocaleString()}</p>
            <p><span className="text-gray-600">Department:</span> {requisition.department}</p>
            {requisition.processedBy && (
              <p><span className="text-gray-600">Processed by:</span> {requisition.processedBy.name}</p>
            )}
            {requisition.remarks && (
              <p><span className="text-gray-600">Remarks:</span> {requisition.remarks}</p>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Items</h4>
          <div className="border rounded-lg divide-y">
            {requisition.items.map((item, idx) => (
              <div key={idx} className="p-3">
                <p className="font-medium">{item.name}</p>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Quantity: {item.quantity}</span>
                  <span>Purpose: {item.purpose}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {requisition.status === 'pending' && (
        <button
          onClick={handleCancel}
          disabled={canceling}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {canceling ? 'Canceling...' : 'Cancel Requisition'}
        </button>
      )}
    </div>
  );
};

export default RequisitionDetail;