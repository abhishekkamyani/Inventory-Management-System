// components/AdminAuditLogs.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminAuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllAuditLogs = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/audit-logs/all', {
          withCredentials: true,
        });
        setAuditLogs(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching all audit logs:', err);
        setError('Failed to fetch all audit logs');
        setLoading(false);
      }
    };

    fetchAllAuditLogs();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Loading all audit logs...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow overflow-hidden">
      <h3 className="text-lg font-semibold mb-4">All Audit Logs</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {auditLogs.map((log, index) => (
              <tr key={index}>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">{log.user}</td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">{log.email}</td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">{log.action}</td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAuditLogs;