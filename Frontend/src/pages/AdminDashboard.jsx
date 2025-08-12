import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, BoxesIcon, ClipboardList, Menu, X, FileText, Package, Settings as SettingsIcon, UserCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Import the components
import UserManagement from '../modules/admin/UserManagement';
import Inventory from '../modules/admin/InventoryConfig';
import Requisitions from '../modules/admin/RequisitionApprovals';
import Departments from '../modules/admin/Departments';
import Reports from '../modules/admin/Reports';
import Settings from '../modules/admin/Settings';

const AdminDashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalItems: 0,
    pendingRequests: 0,
    lowStockItems: 0,
    activeUsers: 0,
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventoryByCategory, setInventoryByCategory] = useState([]);
  const [monthlyRequests, setMonthlyRequests] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  // Track window width for responsive adjustments
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // API fetch functions
  const fetchActiveUsersCount = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/users/active-users', {
        withCredentials: true,
      });
      setStats(prev => ({ ...prev, activeUsers: response.data.activeUsersCount }));
    } catch (err) {
      console.error('Error fetching active users count:', err);
    }
  };

  const fetchPendingRequestsCount = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/requisitions/pending-count', {
        withCredentials: true,
      });
      setStats(prev => ({ ...prev, pendingRequests: response.data.count }));
    } catch (err) {
      console.error('Error fetching pending requests count:', err);
    }
  };

  const fetchTotalItemsCount = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/inventory/total-items', {
        withCredentials: true,
      });
      setStats(prev => ({ ...prev, totalItems: response.data.totalItemsCount }));
    } catch (err) {
      console.error('Error fetching total items count:', err);
    }
  };

  const fetchLowStockItems = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/inventory/low-stock-items', {
        withCredentials: true,
      });
      if (response.data.success) {
        setLowStockItems(response.data.data || []);
        setStats(prev => ({ ...prev, lowStockItems: response.data.data.length }));
      }
    } catch (err) {
      console.error('Error fetching low stock items:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/inventory/categories', {
        withCredentials: true,
      });
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchInventoryByCategory = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/inventory/category-stats', {
        withCredentials: true,
      });
      if (response.data.success) {
        setInventoryByCategory(response.data.data.map(item => ({
          name: item.name,
          value: item.value
        })));
      }
    } catch (err) {
      console.error('API Error:', err);
    }
  };

  const fetchMonthlyRequisitions = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/requisitions/monthly-stats', {
        withCredentials: true,
      });
      if (response.data.success) {
        setMonthlyRequests(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching monthly requisitions:', err);
    }
  };

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchActiveUsersCount(),
        fetchTotalItemsCount(),
        fetchLowStockItems(),
        fetchCategories(),
        fetchPendingRequestsCount(),
        fetchInventoryByCategory(),
        fetchMonthlyRequisitions()
      ]);
    };
    fetchData();
  }, []);

  const generateCategoryColors = (count) => {
    const baseColors = [
      '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
      '#A28DFF', '#FF6B6B', '#4ECDC4', '#FF9F43',
      '#7ED321', '#BD10E0', '#4A90E2', '#50E3C2'
    ];
    return count <= baseColors.length ? baseColors.slice(0, count) : [
      ...baseColors,
      ...Array.from({ length: count - baseColors.length }, (_, i) =>
        `hsl(${Math.floor(i * (360 / (count - baseColors.length)))}, 65%, 50%)`
      )
    ];
  };

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
          <div className="space-y-4 md:space-y-6">
            {/* Stats Cards - Responsive grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                title="Total Items"
                value={stats.totalItems}
                icon={<Package className="text-blue-500" size={windowWidth < 640 ? 18 : 20} />}
                color="bg-blue-100"
              />
              <StatCard
                title="Pending Requests"
                value={stats.pendingRequests}
                icon={<ClipboardList className="text-yellow-500" size={windowWidth < 640 ? 18 : 20} />}
                color="bg-yellow-100"
              />
              <StatCard
                title="Low Stock Items"
                value={stats.lowStockItems}
                icon={<BoxesIcon className="text-red-500" size={windowWidth < 640 ? 18 : 20} />}
                color="bg-red-100"
              />
              <StatCard
                title="Active Users"
                value={stats.activeUsers}
                icon={<Users className="text-green-500" size={windowWidth < 640 ? 18 : 20} />}
                color="bg-green-100"
              />
            </div>

            {/* Charts - Responsive layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Monthly Requisition Requests</h3>
                <div className="h-60 sm:h-72">
                  {monthlyRequests.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyRequests} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="requests" fill="#1B2850" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 text-sm sm:text-base">No requisition data available</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Inventory by Category</h3>
                <div className="h-60 sm:h-72">
                  {inventoryByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={inventoryByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            windowWidth < 640 ? (
                              // Mobile-specific label rendering
                              <text
                                style={{
                                  fontSize: "10px", // Smaller font size for mobile
                                  overflow: "visible", // Ensure text is not clipped
                                }}
                              >
                                {`${name} ${(percent * 100).toFixed(0)}%`}
                              </text>
                            ) : (
                              // Default desktop label rendering
                              `${name} ${(percent * 100).toFixed(0)}%`
                            )
                          }
                          outerRadius={windowWidth < 640 ? 70 : 80} // Adjust radius for mobile
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {inventoryByCategory.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={generateCategoryColors(inventoryByCategory.length)[
                                index % generateCategoryColors(inventoryByCategory.length).length
                              ]}
                            />
                          ))}
                        </Pie>
                        {/* Render Tooltip only for mobile */}
                        {windowWidth < 640 && (
                          <Tooltip
                            formatter={(value, name) => [`${value}%`, name]}
                            contentStyle={{ fontSize: "12px" }}
                          />
                        )}
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 text-sm sm:text-base">No category data available</p>
                    </div>
                  )}
                </div>
              </div>
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
                <table className="min-w-[600px] w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                      <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Current</th>
                      <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Minimum</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(lowStockItems) && lowStockItems.map((item, index) => {
                      const category = categories.find((cat) => cat._id === item.category);
                      const categoryName = category ? category.name : "N/A";
                      return (
                        <tr key={index}>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm">{item.name}</td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm">{categoryName}</td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-red-600">{item.current}</td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm">{item.minimum}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'users':
        return <UserManagement />;
      case 'inventory':
        return <Inventory />;
      case 'requisitions':
        return <Requisitions />;
      case 'departments':
        return <Departments />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-md bg-[#1B2850] text-white shadow-md"
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
        <div className="p-3 sm:p-4">
          <div className="text-lg sm:text-xl font-bold mb-6 sm:mb-8">SIBAU IMS</div>
          <nav className="space-y-1 sm:space-y-2">
            <SidebarItem
              icon={<LayoutDashboard size={windowWidth < 640 ? 18 : 20} />}
              text="Dashboard"
              active={selectedMenu === 'dashboard'}
              onClick={() => { setSelectedMenu('dashboard'); setIsMobileMenuOpen(false); }}
            />
            <SidebarItem
              icon={<Users size={windowWidth < 640 ? 18 : 20} />}
              text="User Management"
              active={selectedMenu === 'users'}
              onClick={() => { setSelectedMenu('users'); setIsMobileMenuOpen(false); }}
            />
            <SidebarItem
              icon={<BoxesIcon size={windowWidth < 640 ? 18 : 20} />}
              text="Inventory"
              active={selectedMenu === 'inventory'}
              onClick={() => { setSelectedMenu('inventory'); setIsMobileMenuOpen(false); }}
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
              icon={<SettingsIcon size={windowWidth < 640 ? 18 : 20} />}
              text="Settings"
              active={selectedMenu === 'settings'}
              onClick={() => { setSelectedMenu('settings'); setIsMobileMenuOpen(false); }}
            />
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm relative z-10">
          <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3">
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 ml-10 sm:ml-12 lg:ml-0">
              Admin Dashboard
            </h1>
            <div className="flex items-center">
              <div className="relative dropdown-container">
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
                      className="block w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-red-600 hover:bg-gray-100"
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
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
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

export default AdminDashboard;