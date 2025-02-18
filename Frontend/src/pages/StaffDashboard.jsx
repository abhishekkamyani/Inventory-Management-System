import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BoxesIcon, ClipboardList, Bell, Menu, X, FileText, Package, UserCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Import components
import StockLevels from '../modules/staff/StockLevels';
import Requisitions from '../modules/staff/Requisitions';
import StockAudit from '../modules/staff/StockAudit';
import SupplierCommunication from '../modules/staff/SupplierCommunication';
import QRCodeScanner from '../modules/staff/QRCodeScanner';

const StaffDashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalItems: 0,
    pendingRequisitions: 0,
    lowStockItems: 0,
  });

  const navigate = useNavigate();

  // Fetch initial stats for the dashboard
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/staff/stats', {
          withCredentials: true,
        });
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
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

  const renderContent = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                title="Total Items"
                value={stats.totalItems}
                icon={<Package className="text-blue-500" />}
                color="bg-blue-100"
              />
              <StatCard
                title="Pending Requisitions"
                value={stats.pendingRequisitions}
                icon={<ClipboardList className="text-yellow-500" />}
                color="bg-yellow-100"
              />
              <StatCard
                title="Low Stock Items"
                value={stats.lowStockItems}
                icon={<BoxesIcon className="text-red-500" />}
                color="bg-red-100"
              />
            </div>

            <div className="bg-white p-4 rounded-lg shadow overflow-hidden">
              <h3 className="text-lg font-semibold mb-4">Recent Low Stock Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Minimum</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      { name: 'Printer Paper', category: 'Stationery', current: 50, minimum: 100 },
                      { name: 'Ink Cartridges', category: 'Electronics', current: 5, minimum: 20 },
                      { name: 'Notebooks', category: 'Stationery', current: 25, minimum: 50 }
                    ].map((item, index) => (
                      <tr key={index}>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">{item.name}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">{item.category}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-red-600">{item.current}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">{item.minimum}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'stock-levels':
        return <StockLevels />;
      case 'requisitions':
        return <Requisitions />;
      case 'stock-audit':
        return <StockAudit />;
      case 'supplier-communication':
        return <SupplierCommunication />;
      case 'qr-scanner':
        return <QRCodeScanner />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Menu Button */}
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
            <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" active={selectedMenu === 'dashboard'} onClick={() => { setSelectedMenu('dashboard'); setIsMobileMenuOpen(false); }} />
            <SidebarItem icon={<BoxesIcon size={20} />} text="Stock Levels" active={selectedMenu === 'stock-levels'} onClick={() => { setSelectedMenu('stock-levels'); setIsMobileMenuOpen(false); }} />
            <SidebarItem icon={<ClipboardList size={20} />} text="Requisitions" active={selectedMenu === 'requisitions'} onClick={() => { setSelectedMenu('requisitions'); setIsMobileMenuOpen(false); }} />
            <SidebarItem icon={<FileText size={20} />} text="Stock Audit" active={selectedMenu === 'stock-audit'} onClick={() => { setSelectedMenu('stock-audit'); setIsMobileMenuOpen(false); }} />
            <SidebarItem icon={<FileText size={20} />} text="Supplier Communication" active={selectedMenu === 'supplier-communication'} onClick={() => { setSelectedMenu('supplier-communication'); setIsMobileMenuOpen(false); }} />
            <SidebarItem icon={<FileText size={20} />} text="QR Code Scanner" active={selectedMenu === 'qr-scanner'} onClick={() => { setSelectedMenu('qr-scanner'); setIsMobileMenuOpen(false); }} />
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 ml-12 lg:ml-0">Staff Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell size={20} />
              </button>
              <div className="relative">
                <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <UserCircle size={24} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden">
                    <button className="block w-full px-4 py-2 text-left hover:bg-gray-100">Account Settings</button>
                    <button className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100" onClick={handleLogout}>Logout</button>
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
    className={`flex items-center space-x-2 w-full p-3 rounded-lg transition-colors ${
      active ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-blue-800'
    }`}
  >
    {icon}
    <span>{text}</span>
  </button>
);

export default StaffDashboard;