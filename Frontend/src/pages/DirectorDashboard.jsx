import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ClipboardList, Bell, Menu, X, FileText, Package, UserCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Director components
import RequisitionHistory from '../modules/director/RequisitionHistory';
import NewRequisition from '../modules/director/NewRequisition';
import TrackRequisitions from '../modules/director/TrackRequisitions';
import DirectorSettings from '../modules/director/Settings';
import RequisitionDetail from '../modules/director/RequisitionDetail';

const DirectorDashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState({
    stats: false,
    recent: false
  });
  const [error, setError] = useState({
    stats: null,
    recent: null
  });

  const navigate = useNavigate();
  const API_BASE_URL = "http://localhost:3000";

  const fetchDashboardStats = async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      const response = await axios.get(`${API_BASE_URL}/api/director/stats`, {
        withCredentials: true
      });
      setStats(response.data.data);
    } catch (err) {
      console.error('Error:', err);
      setError(prev => ({ ...prev, stats: 'Failed to load stats' }));
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  const fetchRecentRequisitions = async () => {
    try {
      setLoading(prev => ({ ...prev, recent: true }));
      const response = await axios.get(`${API_BASE_URL}/api/director/recent`, {
        withCredentials: true
      });
      setRecentRequests(response.data.data);
    } catch (err) {
      console.error('Error:', err);
      setError(prev => ({ ...prev, recent: 'Failed to load recent requisitions' }));
    } finally {
      setLoading(prev => ({ ...prev, recent: false }));
    }
  };

  useEffect(() => {
    if (selectedMenu === 'dashboard') {
      fetchDashboardStats();
      fetchRecentRequisitions();
    }
  }, [selectedMenu]);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem('authToken');
      navigate('/');
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  const renderContent = () => {
    switch (selectedMenu) {
      // In the renderContent() function's dashboard case:
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Pending Requests"
                value={stats.pending}
                icon={<ClipboardList className="text-yellow-500" />}
                color="bg-yellow-100"
              />
              <StatCard
                title="Approved Requests"
                value={stats.approved}
                icon={<ClipboardList className="text-green-500" />}
                color="bg-green-100"
              />
              <StatCard
                title="Rejected Requests"
                value={stats.rejected}
                icon={<ClipboardList className="text-red-500" />}
                color="bg-red-100"
              />
              <StatCard
                title="Total Requests"
                value={stats.total}
                icon={<ClipboardList className="text-blue-500" />}
                color="bg-blue-100"
              />
            </div>

            {/* Recent Requisitions Table */}
            <div className="bg-white p-4 rounded-lg shadow overflow-hidden">
              <h3 className="text-lg font-semibold mb-4">Recent Requisitions</h3>

              {loading.recent ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : error.recent ? (
                <div className="text-red-500 p-4">{error.recent}</div>
              ) : !Array.isArray(recentRequests) || recentRequests.length === 0 ? (
                <div className="text-gray-500 p-4">No recent requisitions found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentRequests.map((request) => (
                        <tr key={request._id}>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">#{request._id.slice(-6)}</td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                            {request.items.length} items
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'
                              }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
        return (
          <div className="space-y-6">
            {/* Stats Cards - Keep existing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Pending Requests"
                value={stats.pending}
                icon={<ClipboardList className="text-yellow-500" />}
                color="bg-yellow-100"
              />
              <StatCard
                title="Approved Requests"
                value={stats.approved}
                icon={<ClipboardList className="text-green-500" />}
                color="bg-green-100"
              />
              <StatCard
                title="Rejected Requests"
                value={stats.rejected}
                icon={<ClipboardList className="text-red-500" />}
                color="bg-red-100"
              />
              <StatCard
                title="Total Requests"
                value={stats.total}
                icon={<ClipboardList className="text-blue-500" />}
                color="bg-blue-100"
              />
            </div>

            {/* Recent Requisitions Table - Updated to match Faculty Dashboard */}
            <div className="bg-white p-4 rounded-lg shadow overflow-hidden">
              <h3 className="text-lg font-semibold mb-4">Recent Requisitions</h3>

              {loading.recent ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : error.recent ? (
                <div className="text-red-500 p-4">{error.recent}</div>
              ) : !Array.isArray(recentRequests) || recentRequests.length === 0 ? (
                <div className="text-gray-500 p-4">No recent requisitions found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentRequests.map((request) => (
                        <tr key={request._id}>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">#{request._id.slice(-6)}</td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                            {request.items.length} items
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                              }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => navigate(`/requisition/${request._id}`)}
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
              )}
            </div>
          </div>
        );
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Pending Requests"
                value={stats.pending}
                icon={<ClipboardList className="text-yellow-500" />}
                color="bg-yellow-100"
              />
              <StatCard
                title="Approved Requests"
                value={stats.approved}
                icon={<ClipboardList className="text-green-500" />}
                color="bg-green-100"
              />
              <StatCard
                title="Rejected Requests"
                value={stats.rejected}
                icon={<ClipboardList className="text-red-500" />}
                color="bg-red-100"
              />
              <StatCard
                title="Total Requests"
                value={stats.total}
                icon={<ClipboardList className="text-blue-500" />}
                color="bg-blue-100"
              />
            </div>

            <div className="bg-white p-4 rounded-lg shadow overflow-hidden">
              <h3 className="text-lg font-semibold mb-4">Recent Requisitions</h3>

              {loading.recent ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : error.recent ? (
                <div className="text-red-500 p-4">{error.recent}</div>
              ) : recentRequests.length === 0 ? (
                <div className="text-gray-500 p-4">No recent requisitions found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentRequests.map((request) => (
                        <tr key={request._id}>
                          <td className="px-6 py-4 whitespace-nowrap">#{request._id.slice(-6)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{request.items.length} items</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                              }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => navigate(`/requisition/${request._id}`)}
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
              )}
            </div>
          </div>
        );
      case 'new-requisition':
        return <NewRequisition onSuccess={() => {
          setSelectedMenu('dashboard');
          fetchDashboardStats();
          fetchRecentRequisitions();
        }} />;
      case 'requisition-history':
        return <RequisitionHistory />;
      case 'track-orders':
        return <TrackRequisitions />;
      case 'settings':
        return <DirectorSettings />;
      case 'requisition-detail':
        return <RequisitionDetail />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-[#1B2850] text-white"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:static w-64 bg-[#1B2850] text-white h-full z-40
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4">
          <div className="text-xl font-bold mb-8">SIBA IMS</div>
          <nav className="space-y-2">
            <SidebarItem
              icon={<LayoutDashboard size={20} />}
              text="Dashboard"
              active={selectedMenu === 'dashboard'}
              onClick={() => setSelectedMenu('dashboard')}
            />
            <SidebarItem
              icon={<ClipboardList size={20} />}
              text="New Requisition"
              active={selectedMenu === 'new-requisition'}
              onClick={() => setSelectedMenu('new-requisition')}
            />
            <SidebarItem
              icon={<FileText size={20} />}
              text="Requisition History"
              active={selectedMenu === 'requisition-history'}
              onClick={() => setSelectedMenu('requisition-history')}
            />
            <SidebarItem
              icon={<Package size={20} />}
              text="Track Orders"
              active={selectedMenu === 'track-orders'}
              onClick={() => setSelectedMenu('track-orders')}
            />
            <SidebarItem
              icon={<UserCircle size={20} />}
              text="Settings"
              active={selectedMenu === 'settings'}
              onClick={() => setSelectedMenu('settings')}
            />
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 ml-12 lg:ml-0">
              {selectedMenu === 'dashboard' && 'Director Dashboard'}
              {selectedMenu === 'new-requisition' && 'New Requisition'}
              {selectedMenu === 'requisition-history' && 'Requisition History'}
              {selectedMenu === 'track-orders' && 'Track Orders'}
              {selectedMenu === 'settings' && 'Settings'}
            </h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell size={20} />
              </button>
              <div className="relative">
                <button
                  className="p-2 rounded-full hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <UserCircle size={24} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50">
                    <button
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={() => {
                        setSelectedMenu('settings');
                        setIsDropdownOpen(false);
                      }}
                    >
                      Account Settings
                    </button>
                    <button
                      className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className={`${color} p-4 sm:p-6 rounded-lg shadow-sm`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-xl sm:text-2xl font-semibold mt-2">{value}</p>
      </div>
      {icon}
    </div>
  </div>
);

const SidebarItem = ({ icon, text, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 w-full p-3 rounded-lg transition-colors ${active ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-blue-800'
      }`}
  >
    {icon}
    <span>{text}</span>
  </button>
);

export default DirectorDashboard;