import React, { useState, useEffect } from "react";
import axios from "axios";
import { User } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Admin",
    status: "Active",
  });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window width
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/users", {
          withCredentials: true,
        });
        setUsers(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Toggle user status
  const toggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Deactive" : "Active";
    try {
      const response = await axios.patch(
        `http://localhost:3000/auth/activate/${userId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      setUsers(users.map(user =>
        user._id === userId ? { ...user, status: response.data.user.status } : user
      ));
    } catch (err) {
      console.error("Error updating user status:", err.response?.data || err.message);
    }
  };

  // Handle user deletion
  const deleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:3000/api/users/${userId}`, {
        withCredentials: true,
      });
      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredUsers = users.filter(user => {
    if (!user) return false;

    const searchTerm = searchQuery.toLowerCase();
    const userName = String(user.fullName || '').toLowerCase();
    const userEmail = String(user.email || '').toLowerCase();
    const userRole = String(user.role || '').toLowerCase();

    return (
      userName.includes(searchTerm) ||
      userEmail.includes(searchTerm) ||
      userRole.includes(searchTerm)
    );
  });

  // Handle form input changes
  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  // Handle form submission
  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsAddingUser(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/users",
        newUser,
        { withCredentials: true }
      );
      setUsers([...users, response.data.user]);
      setIsAddUserModalOpen(false);
      setNewUser({
        fullName: "",
        email: "",
        password: "",
        role: "Admin",
        status: "Active",
      });
      toast.success("User created successfully! Please review in admin dashboard.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setIsAddingUser(false);
    }
  };

  if (loading) return <div className="p-6">Loading users...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <ToastContainer />
      <h2 className="text-xl font-semibold mb-4 sm:mb-6">User Management</h2>

      {/* Search and Add User */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="flex-grow px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
        />
        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap text-sm sm:text-base"
        >
          Add New User
        </button>
      </div>

      {/* Desktop Table */}
      {windowWidth >= 640 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    {user.fullName}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm capitalize">{user.role.toLowerCase()}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => toggleUserStatus(user._id, user.status)}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      {user.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Mobile Cards */
        /* Mobile Cards */
        <div className="space-y-3">
          {filteredUsers.map(user => (
            <div key={user._id} className="border rounded-lg p-3 shadow-sm">
              <div className="flex items-center mb-2">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <div className="font-medium">{user.fullName}</div>
              </div>

              <div className="flex justify-between mb-2">
                <div className="flex-1 min-w-0"> {/* Added min-w-0 to allow text truncation */}
                  <div className="text-gray-500 text-xs">Email</div>
                  <div className="truncate text-sm">{user.email}</div> {/* Added truncate class */}
                </div>
                <div className="ml-4"> {/* Moved role to the right with margin */}
                  <div className="text-gray-500 text-xs">Role</div>
                  <div className="capitalize text-sm text-right">{user.role.toLowerCase()}</div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                  {user.status}
                </span>

                <div className="space-x-2">
                  <button
                    onClick={() => toggleUserStatus(user._id, user.status)}
                    className="text-blue-600 hover:text-blue-900 text-xs"
                  >
                    {user.status === "Active" ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => deleteUser(user._id)}
                    className="text-red-600 hover:text-red-900 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Add New User</h3>
              <form onSubmit={handleAddUser} className={isAddingUser ? 'opacity-80' : ''}>
                <fieldset disabled={isAddingUser} className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={newUser.fullName}
                      onChange={handleNewUserChange}
                      className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={newUser.email}
                      onChange={handleNewUserChange}
                      className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={newUser.password}
                      onChange={handleNewUserChange}
                      className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Role</label>
                    <select
                      name="role"
                      value={newUser.role}
                      onChange={handleNewUserChange}
                      className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Staff">Staff</option>
                      <option value="Faculty">Faculty</option>
                      <option value="Director">Director</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-2 sm:space-x-3 pt-3 sm:pt-4">
                    <button
                      type="button"
                      onClick={() => setIsAddUserModalOpen(false)}
                      className="px-3 sm:px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isAddingUser}
                      className={`px-3 sm:px-4 py-2 text-white rounded-lg flex items-center justify-center min-w-[6rem] sm:min-w-[7rem] text-sm sm:text-base ${isAddingUser ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                      {isAddingUser ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Adding...
                        </>
                      ) : (
                        "Add User"
                      )}
                    </button>
                  </div>
                </fieldset>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;