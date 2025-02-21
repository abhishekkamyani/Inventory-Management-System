import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FacultyDashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return (
          <div>
            <h2>Dashboard</h2>
            <p>Welcome to the Faculty Dashboard!</p>
            <div>
              <h3>Quick Stats</h3>
              <p>Total Requests: 10</p>
              <p>Pending Requests: 3</p>
              <p>Completed Requests: 7</p>
            </div>
          </div>
        );
      case 'request-supplies':
        return (
          <div>
            <h2>Request Supplies</h2>
            <p>Form to request supplies will go here.</p>
          </div>
        );
      case 'track-orders':
        return (
          <div>
            <h2>Track Orders</h2>
            <p>Order tracking information will go here.</p>
          </div>
        );
      case 'inventory-info':
        return (
          <div>
            <h2>Inventory Information</h2>
            <p>Details about available inventory will go here.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Sidebar */}
      <div>
        <h1>SIBA IMS</h1>
        <nav>
          <button onClick={() => setSelectedMenu('dashboard')}>Dashboard</button>
          <button onClick={() => setSelectedMenu('request-supplies')}>Request Supplies</button>
          <button onClick={() => setSelectedMenu('track-orders')}>Track Orders</button>
          <button onClick={() => setSelectedMenu('inventory-info')}>Inventory Info</button>
        </nav>
      </div>

      {/* Main Content */}
      <div>
        <header>
          <h1>Faculty Dashboard</h1>
          <button onClick={handleLogout}>Logout</button>
        </header>
        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboard;