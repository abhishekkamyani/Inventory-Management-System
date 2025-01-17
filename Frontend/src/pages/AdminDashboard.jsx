import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Import child components
import UserManagement from "../modules/admin/UserManagement";
import InventoryConfig from "../modules/admin/InventoryConfig";
import RequisitionApprovals from "../modules/admin/RequisitionApprovals";
import Reporting from "../modules/admin/Reporting";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedContent, setSelectedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current user data from backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/auth/currentUser", {
          withCredentials: true,
        });
        
        setCurrentUser(response.data.user);
      } catch (err) {
        console.log(err.message);
        setError("Failed to fetch user data. Please log in again !.");
        setTimeout(() => {
          navigate("/"); // Redirect to login if fetching user fails
        }, 2000);
      }
    };
  
    fetchUserData();
  }, [navigate]);
  

  // Handle Logout
  const handleLogout = async () => {
    try {
      // Send logout request to the backend to clear session or invalidate token
      await axios.post("http://localhost:3000/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Error during logout", err);
    }
    localStorage.removeItem("authToken"); // Optional: In case you store anything else in localStorage
    navigate("/"); // Navigate to login screen
  };
  

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header Section */}
      <header className="flex justify-between items-center p-6 bg-white shadow-md">
        <h1 className="text-2xl font-semibold text-teal-600">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Welcome, {currentUser?.fullName || "Admin"}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 flex gap-6">
        {/* Sidebar */}
        <aside className="w-1/4 bg-white shadow-lg rounded-lg p-4">
          <h2 className="text-lg font-semibold text-center mb-4">Options</h2>
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => setSelectedContent(<UserManagement />)}
                className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                User Management
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedContent(<InventoryConfig />)}
                className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Inventory Configuration
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedContent(<RequisitionApprovals />)}
                className="w-full p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                Requisition Approvals
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedContent(<Reporting />)}
                className="w-full p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                Reporting
              </button>
            </li>
          </ul>
        </aside>

        {/* Main Panel */}
        <main className="flex-1 bg-white shadow-lg rounded-lg p-6">
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {selectedContent || (
            <div className="text-center text-gray-600">
              <h2 className="text-xl font-semibold">Welcome to the Admin Dashboard</h2>
              <p>Select an option from the sidebar to proceed.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
