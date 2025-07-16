import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, BoxesIcon, ClipboardList, Bell, Menu, X, FileText, Package, Settings as SettingsIcon, UserCircle } from 'lucide-react';
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
    totalItems: 0, // Initialize to 0
    pendingRequests: 25, // You can keep this or fetch it from the backend
    lowStockItems: 0, // Initialize to 0
    activeUsers: 0, // Initialize to 0
  });
  const [lowStockItems, setLowStockItems] = useState([]); // Initialize as an empty array
  const [categories, setCategories] = useState([]); // Add categories state
  const [inventoryByCategory, setInventoryByCategory] = useState([]);
  const navigate = useNavigate();

  // Fetch active users count from the backend
  const fetchActiveUsersCount = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/users/active-users', {
        withCredentials: true,
      });
      setStats((prevStats) => ({
        ...prevStats,
        activeUsers: response.data.activeUsersCount,
      }));
    } catch (err) {
      console.error('Error fetching active users count:', err);
    }
  };

  // Add this function to fetch pending requests count
  const fetchPendingRequestsCount = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/requisitions/pending-count', {
        withCredentials: true,
      });
      setStats((prevStats) => ({
        ...prevStats,
        pendingRequests: response.data.count,
      }));
    } catch (err) {
      console.error('Error fetching pending requests count:', err);
      // You can keep the default value or set it to 0
      setStats((prevStats) => ({
        ...prevStats,
        pendingRequests: 0,
      }));
    }
  };

  // Fetch total items count from the backend
  const fetchTotalItemsCount = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/inventory/total-items', {
        withCredentials: true,
      });
      setStats((prevStats) => ({
        ...prevStats,
        totalItems: response.data.totalItemsCount,
      }));
    } catch (err) {
      console.error('Error fetching total items count:', err);
    }
  };

  // Fetch low stock items from the backend
  const fetchLowStockItems = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/inventory/low-stock-items', {
        withCredentials: true,
      });

      if (response.data.success) {
        setLowStockItems(response.data.data); // Update state with formatted data
        setStats((prevStats) => ({
          ...prevStats,
          lowStockItems: response.data.data.length, // Update lowStockItems count
        }));
      } else {
        console.error('Error fetching low stock items:', response.data.message);
        setLowStockItems([]); // Set to empty array in case of an error
        setStats((prevStats) => ({
          ...prevStats,
          lowStockItems: 0, // Reset lowStockItems count
        }));
      }
    } catch (err) {
      console.error('Error fetching low stock items:', err);
      setLowStockItems([]); // Set to empty array in case of an error
      setStats((prevStats) => ({
        ...prevStats,
        lowStockItems: 0, // Reset lowStockItems count
      }));
    }
  };

  // Fetch categories from the backend
  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/inventory/categories', {
        withCredentials: true,
      });
      setCategories(response.data); // Update categories state
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchInventoryByCategory = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/inventory/category-stats', {
        withCredentials: true,
      });

      console.log('API Response:', response.data); // Debug log

      if (response.data.success) {
        // Ensure data is in correct format for PieChart
        const formattedData = response.data.data.map(item => ({
          name: item.name,
          value: item.value
        }));

        setInventoryByCategory(formattedData);
      } else {
        console.error('Server returned unsuccessful response:', response.data);
        setInventoryByCategory([]);
      }
    } catch (err) {
      console.error('API Error:', {
        error: err,
        response: err.response?.data
      });
      setInventoryByCategory([]);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      await fetchActiveUsersCount();
      await fetchTotalItemsCount();
      await fetchLowStockItems();
      await fetchCategories(); // Fetch categories
      await fetchPendingRequestsCount();
      await fetchInventoryByCategory();
      await fetchMonthlyRequisitions()
    };

    fetchData();
  }, []);




  const [monthlyRequests, setMonthlyRequests] = useState([]);
  const fetchMonthlyRequisitions = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/requisitions/monthly-stats', {
        withCredentials: true,
      });

      if (response.data.success) {
        setMonthlyRequests(response.data.data);
      } else {
        console.error('Failed to fetch monthly requisitions:', response.data.message);
        setMonthlyRequests([]);
      }
    } catch (err) {
      console.error('Error fetching monthly requisitions:', err);
      setMonthlyRequests([]);
    }
  };


  const generateCategoryColors = (count) => {
    // Base color palette (can be extended)
    const baseColors = [
      '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
      '#A28DFF', '#FF6B6B', '#4ECDC4', '#FF9F43',
      '#7ED321', '#BD10E0', '#4A90E2', '#50E3C2',
      '#B8E986', '#F5A623', '#D0021B', '#8B572A',
      '#9013FE', '#417505', '#FF85CB', '#7A87A1',
      '#D4A59A', '#FF6E4A', '#1CE6FF', '#5E35B1'
    ];

    // If we have more categories than base colors, generate additional colors
    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    }

    // Generate additional colors dynamically using HSL color model
    const additionalColors = [];
    const hueStep = 360 / (count - baseColors.length);

    for (let i = 0; i < count - baseColors.length; i++) {
      const hue = Math.floor(i * hueStep);
      // Vary saturation and lightness for better distinction
      const saturation = 65 + Math.floor(Math.random() * 20);
      const lightness = 50 + Math.floor(Math.random() * 15);
      additionalColors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }

    return [...baseColors, ...additionalColors];
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Items"
                value={stats.totalItems}
                icon={<Package className="text-blue-500" />}
                color="bg-blue-100"
              />
              <StatCard
                title="Pending Requests"
                value={stats.pendingRequests}
                icon={<ClipboardList className="text-yellow-500" />}
                color="bg-yellow-100"
              />
              <StatCard
                title="Low Stock Items"
                value={stats.lowStockItems}
                icon={<BoxesIcon className="text-red-500" />}
                color="bg-red-100"
              />
              <StatCard
                title="Active Users"
                value={stats.activeUsers}
                icon={<Users className="text-green-500" />}
                color="bg-green-100"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Monthly Requisition Requests</h3>
                <div className="h-72">
                  {monthlyRequests.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyRequests} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="requests" fill="#1B2850" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No requisition data available</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Inventory by Category</h3>
                <div className="h-72">
                  {inventoryByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={inventoryByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {inventoryByCategory.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={generateCategoryColors(inventoryByCategory.length)[index % generateCategoryColors(inventoryByCategory.length).length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No category data available</p>
                    </div>
                  )}
                </div>
              </div>
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
                    {Array.isArray(lowStockItems) && lowStockItems.map((item, index) => {
                      // Find the category name based on the category ID
                      const category = categories.find((cat) => cat._id === item.category);
                      const categoryName = category ? category.name : "N/A"; // Fallback to "N/A" if category not found

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
            <SidebarItem icon={<Users size={20} />} text="User Management" active={selectedMenu === 'users'} onClick={() => { setSelectedMenu('users'); setIsMobileMenuOpen(false); }} />
            <SidebarItem icon={<BoxesIcon size={20} />} text="Inventory" active={selectedMenu === 'inventory'} onClick={() => { setSelectedMenu('inventory'); setIsMobileMenuOpen(false); }} />
            <SidebarItem icon={<ClipboardList size={20} />} text="Requisitions" active={selectedMenu === 'requisitions'} onClick={() => { setSelectedMenu('requisitions'); setIsMobileMenuOpen(false); }} />
            <SidebarItem icon={<FileText size={20} />} text="Reports" active={selectedMenu === 'reports'} onClick={() => { setSelectedMenu('reports'); setIsMobileMenuOpen(false); }} />
            <SidebarItem icon={<SettingsIcon size={20} />} text="Settings" active={selectedMenu === 'settings'} onClick={() => { setSelectedMenu('settings'); setIsMobileMenuOpen(false); }} />
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm relative z-10">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 ml-12 lg:ml-0">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell size={20} />
              </button>
              <div className="relative">
                <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <UserCircle size={24} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50">
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
    className={`flex items-center space-x-2 w-full p-3 rounded-lg transition-colors ${active ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-blue-800'
      }`}
  >
    {icon}
    <span>{text}</span>
  </button>
);

export default AdminDashboard;