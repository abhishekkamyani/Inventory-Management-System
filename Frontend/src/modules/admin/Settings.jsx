import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Settings = () => {
  const [user, setUser] = useState({
    fullName: '',
    password: '', // Only fullName and password are editable
  });
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // Tab state: 'profile' or 'password'

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/users/me', {
          withCredentials: true,
        });
  
        console.log('Backend Response:', response); // Log the response
  
        if (response.data) {
          setUser((prevUser) => ({
            ...prevUser,
            fullName: response.data.fullName,
          }));
        } else {
          setMessage('No user data found.');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      //  setMessage('Failed to fetch user data. Please try again.');
      }
    };
  
    fetchUserData();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { fullName, password } = user; // Only send fullName and password
      const data = activeTab === 'profile' ? { fullName } : { password }; // Send only the relevant field

      const response = await axios.put(
        'http://localhost:3000/api/users/update',
        data,
        { withCredentials: true }
      );

      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);

      // Clear password field after successful update
      if (activeTab === 'password') {
        setUser((prevUser) => ({
          ...prevUser,
          password: '',
        }));
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage('Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Settings</h2>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 ${
            activeTab === 'profile'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 ${
            activeTab === 'password'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500'
          }`}
        >
          Password
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={user.fullName}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Update Profile
          </button>
        </form>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              name="password"
              value={user.password}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter new password"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Update Password
          </button>
        </form>
      )}

      {/* Success/Error Message */}
      {message && (
        <p
          className={`mt-4 ${
            message.includes('successfully') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default Settings;