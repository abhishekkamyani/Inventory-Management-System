import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard,
  Users,
  BoxesIcon,
  ClipboardList,
  Bell,
  LogOut,
  TrendingUp,
  Building2,
  QrCode,
  FileText,
  Package,
  Settings as SettingsIcon,
} from 'lucide-react';
import UserManagement from '../components/UserManagement';
import Inventory from '../components/Inventory';
import Requisitions from '../components/Requisitions';
import Departments from '../components/Departments';
import QRScanner from '../components/QRScanner';
import Reports from '../components/Reports';
import Settings from '../components/Settings';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    totalItems: 0,
    pendingRequests: 0,
    lowStockItems: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/auth/currentUser', {
          withCredentials: true,
        });
        setCurrentUser(response.data.user);
      } catch (err) {
        console.error(err.message);
        setTimeout(() => navigate('/'), 2000);
      }
    };
    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const inventoryResponse = await axios.get('http://localhost:3000/inventory/stats', {
          withCredentials: true,
        });
        const { totalItems, lowStockItems } = inventoryResponse.data;

        const requisitionResponse = await axios.get('http://localhost:3000/requisitions/stats', {
          withCredentials: true,
        });
        const { pendingRequests } = requisitionResponse.data;

        const userResponse = await axios.get('http://localhost:3000/users/stats', {
          withCredentials: true,
        });
        const { activeUsers } = userResponse.data;

        setStats({ totalItems, pendingRequests, lowStockItems, activeUsers });
      } catch (err) {
        console.error('Error fetching stats:', err.message);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/auth/logout', {}, { withCredentials: true });
      localStorage.removeItem('authToken');
      navigate('/');
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-[#1B2850] text-white">
        <div className="p-4">
          <div className="text-xl font-bold mb-8">SIBA IMS</div>
          <nav>
            <SidebarItem
              icon={<LayoutDashboard size={20} />}
              text="Dashboard"
              active={selectedMenu === 'dashboard'}
              onClick={() => setSelectedMenu('dashboard')}
            />
            <SidebarItem
              icon={<Users size={20} />}
              text="User Management"
              active={selectedMenu === 'users'}
              onClick={() => setSelectedMenu('users')}
            />
            <SidebarItem
              icon={<BoxesIcon size={20} />}
              text="Inventory"
              active={selectedMenu === 'inventory'}
              onClick={() => setSelectedMenu('inventory')}
            />
            <SidebarItem
              icon={<ClipboardList size={20} />}
              text="Requisitions"
              active={selectedMenu === 'requisitions'}
              onClick={() => setSelectedMenu('requisitions')}
            />
            <SidebarItem
              icon={<Building2 size={20} />}
              text="Departments"
              active={selectedMenu === 'departments'}
              onClick={() => setSelectedMenu('departments')}
            />
            <SidebarItem
              icon={<QrCode size={20} />}
              text="QR Scanner"
              active={selectedMenu === 'qr'}
              onClick={() => setSelectedMenu('qr')}
            />
            <SidebarItem
              icon={<FileText size={20} />}
              text="Reports"
              active={selectedMenu === 'reports'}
              onClick={() => setSelectedMenu('reports')}
            />
            <SidebarItem
              icon={<SettingsIcon size={20} />}
              text="Settings"
              active={selectedMenu === 'settings'}
              onClick={() => setSelectedMenu('settings')}
            />
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell size={20} />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-6 overflow-auto h-[calc(100vh-4rem)]">
          {selectedMenu === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard
                icon={<Package className="text-blue-600" />}
                title="Total Items"
                value={stats.totalItems}
                trend="+2.5%"
              />
              <StatCard
                icon={<ClipboardList className="text-yellow-600" />}
                title="Pending Requests"
                value={stats.pendingRequests}
                trend="+0.8%"
              />
              <StatCard
                icon={<BoxesIcon className="text-red-600" />}
                title="Low Stock Items"
                value={stats.lowStockItems}
                trend="-1.2%"
              />
              <StatCard
                icon={<Users className="text-green-600" />}
                title="Active Users"
                value={stats.activeUsers}
                trend="+1.4%"
              />
            </div>
          )}
          {selectedMenu === 'users' && <UserManagement />}
          {selectedMenu === 'inventory' && <Inventory />}
          {selectedMenu === 'requisitions' && <Requisitions />}
          {selectedMenu === 'departments' && <Departments />}
          {selectedMenu === 'qr' && <QRScanner />}
          {selectedMenu === 'reports' && <Reports />}
          {selectedMenu === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, text, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 w-full p-3 rounded-lg transition-colors ${
      active ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-blue-800'
    }`}
  >
    {icon}
    <span>{text}</span>
  </button>
);

const StatCard = ({ icon, title, value, trend }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>
      <div className="flex items-center space-x-1 text-sm">
        <TrendingUp
          size={16}
          className={trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}
        />
        <span className={trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
          {trend}
        </span>
      </div>
    </div>
    <h3 className="text-gray-500 text-sm">{title}</h3>
    <p className="text-2xl font-semibold mt-1">{value}</p>
  </div>
);

export default AdminDashboard;
