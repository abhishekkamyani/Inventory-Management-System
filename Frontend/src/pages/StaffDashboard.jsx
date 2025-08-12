import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BoxesIcon, ClipboardList, Menu, X, FileText, Package, UserCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import components
import StockLevels from '../modules/staff/StockLevels';
import Requisitions from '../modules/staff/Requisitions';
import QRScanner from '../modules/admin/QRScanner';
import Reports from '../modules/staff/Reports';

const StaffDashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalItems: 0,
    approvedRequisitions: 0,
    lowStockItems: 0,
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  // Track window width
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.dropdown-button')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const fetchTotalItemsCount = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/inventory/total-items', {
        withCredentials: true,
      });
      setStats(prev => ({
        ...prev,
        totalItems: response.data.totalItemsCount,
      }));
    } catch (err) {
      console.error('Error fetching total items count:', err);
      toast.error('Failed to load total items count');
    }
  };

  const fetchLowStockItems = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/inventory/low-stock-items', {
        withCredentials: true,
      });
      if (response.data.success) {
        setLowStockItems(response.data.data || []);
        setStats(prev => ({
          ...prev,
          lowStockItems: response.data.data.length,
        }));
      }
    } catch (err) {
      console.error('Error fetching low stock items:', err);
      toast.error('Failed to load low stock items');
      setLowStockItems([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/inventory/categories', {
        withCredentials: true,
      });
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    }
  };

  const fetchApprovedRequisitionsCount = async () => {
    try {
      const response = await axios.get(
        'http://localhost:3000/api/staff/approved-requisitions-count',
        { withCredentials: true }
      );

      console.log("Approved count response:", response.data); // Debug log

      setStats(prev => ({
        ...prev,
        approvedRequisitions: response.data.approvedRequisitionsCount || 0,
      }));
    } catch (err) {
      console.error('Error:', err.response?.data || err.message);
      toast.error('Failed to load approved requisitions count');
    }
  };

  useEffect(() => {
    fetchTotalItemsCount();
    fetchLowStockItems();
    fetchCategories();
    fetchApprovedRequisitionsCount();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/auth/logout', {}, { withCredentials: true });
      localStorage.removeItem('authToken');
      navigate('/');
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Error during logout:', err);
      toast.error('Failed to logout');
    }
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return (
          <div className="space-y-4 md:space-y-6">
            {/* Stats Cards - Responsive grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <StatCard
                title="Total Items"
                value={stats.totalItems}
                icon={<Package className="text-blue-500" size={windowWidth < 640 ? 18 : 20} />}
                color="bg-blue-100"
              />
              <StatCard
                title="Approved Requisitions"
                value={stats.approvedRequisitions}
                icon={<ClipboardList className="text-yellow-500" size={windowWidth < 640 ? 18 : 20} />}
                color="bg-green-100"
              />
              <StatCard
                title="Low Stock Items"
                value={stats.lowStockItems}
                icon={<BoxesIcon className="text-red-500" size={windowWidth < 640 ? 18 : 20} />}
                color="bg-red-100"
              />
            </div>

            {/* Low Stock Items Table */}
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow overflow-hidden">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Recent Low Stock Items</h3>

              {/* Mobile view: Cards */}
              <div className="block sm:hidden space-y-3">
                {Array.isArray(lowStockItems) && lowStockItems.length > 0 ? (
                  lowStockItems.map((item, index) => {
                    const category = categories.find((cat) => cat._id === item.category);
                    const categoryName = category ? category.name : "N/A";
                    return (
                      <div key={index} className="p-3 border border-gray-200 rounded-md shadow-sm bg-gray-50">
                        <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">Category: {categoryName}</p>
                        <p className="text-xs text-red-600">Current: {item.current}</p>
                        <p className="text-xs text-gray-600">Minimum: {item.minimum}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">No low stock items available</p>
                )}
              </div>

              {/* Desktop/tablet view: Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Current</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Minimum</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(lowStockItems) && lowStockItems.map((item, index) => {
                      const category = categories.find((cat) => cat._id === item.category);
                      const categoryName = category ? category.name : "N/A";
                      return (
                        <tr key={index}>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">{item.name}</td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">{categoryName}</td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-red-600">{item.current}</td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">{item.minimum}</td>
                        </tr>
                      );
                    })}
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
      case 'reports':
        return <Reports />;
      case 'qr-scanner':
        return <QRScanner />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <ToastContainer />
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-[#1B2850] text-white shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar - Responsive behavior */}
      <div className={`
        fixed lg:static w-64 bg-[#1B2850] text-white h-full z-40
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4">
          <div className="text-lg sm:text-xl font-bold mb-6 sm:mb-8">SIBAU IMS</div>
          <nav className="space-y-1 sm:space-y-2">
            <SidebarItem
              icon={<LayoutDashboard size={windowWidth < 640 ? 18 : 20} />}
              text="Dashboard"
              active={selectedMenu === 'dashboard'}
              onClick={() => { setSelectedMenu('dashboard'); setIsMobileMenuOpen(false); }}
            />
            <SidebarItem
              icon={<BoxesIcon size={windowWidth < 640 ? 18 : 20} />}
              text="Stock Levels"
              active={selectedMenu === 'stock-levels'}
              onClick={() => { setSelectedMenu('stock-levels'); setIsMobileMenuOpen(false); }}
            />
            <SidebarItem
              icon={<ClipboardList size={windowWidth < 640 ? 18 : 20} />}
              text="Requisitions"
              active={selectedMenu === 'requisitions'}
              onClick={() => { setSelectedMenu('requisitions'); setIsMobileMenuOpen(false); }}
            />
            <SidebarItem
              icon={<FileText size={windowWidth < 640 ? 18 : 20} />}
              text="Reports"
              active={selectedMenu === 'reports'}
              onClick={() => { setSelectedMenu('reports'); setIsMobileMenuOpen(false); }}
            />
            <SidebarItem
              icon={<FileText size={windowWidth < 640 ? 18 : 20} />}
              text="QR Scanner"
              active={selectedMenu === 'qr-scanner'}
              onClick={() => { setSelectedMenu('qr-scanner'); setIsMobileMenuOpen(false); }}
            />
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm relative z-10">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 ml-12 lg:ml-0">
              Staff Dashboard
            </h1>
            <div className="flex items-center">
              <div className="relative dropdown-button">
                <button
                  className="p-1 sm:p-2 rounded-full hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-label="User menu"
                >
                  <UserCircle size={windowWidth < 640 ? 20 : 24} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50">
                    <button
                      className="block w-full px-3 sm:px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
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
  <div className={`${color} p-3 sm:p-4 rounded-lg shadow-sm`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
        <p className="text-lg sm:text-xl md:text-2xl font-semibold mt-1 sm:mt-2">{value}</p>
      </div>
      {icon}
    </div>
  </div>
);

const SidebarItem = ({ icon, text, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 w-full p-2 sm:p-3 rounded-lg transition-colors ${active ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-blue-800'
      }`}
  >
    {icon}
    <span className="text-sm sm:text-base">{text}</span>
  </button>
);

export default StaffDashboard;