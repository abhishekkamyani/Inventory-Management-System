import React, { useState } from 'react';
import { FaLock } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom'; // Import useParams and useNavigate
import Logo from '../assets/sukkur-iba-logo.jpeg'; // Import the logo
import axios from 'axios'; // Import axios for API calls

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams(); // Extract token from URL
  const navigate = useNavigate(); // For redirecting after success

  const handleResetPassword = async (e) => {
    e.preventDefault();
  
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }
  
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
  
    try {
      console.log("Sending Request with:", { password, confirmPassword, token }); // Debugging
  
      const response = await axios.post(`http://localhost:3000/auth/reset-password/${token}`, {
        password,
        confirmPassword, // ✅ Ensure confirmPassword is sent
      });
  
      if (response.data.success) {
        setSuccess(response.data.message); 
        setError('');
        setTimeout(() => navigate('/signin'), 3000);
      } else {
        setError(response.data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      setSuccess('');
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-lg p-8">
        {/* Logo at the top */}
        <div className="flex justify-center mb-6">
          <img src={Logo} alt="Sukkur IBA Logo" className="h-12" />
        </div>

        <h2 className="text-3xl font-bold text-center text-blue-900 mb-8">Reset Password</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}

        <form onSubmit={handleResetPassword}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">New Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                placeholder="Enter new password"
                required
              />
              <div className="absolute right-3 top-3 text-gray-500">
                <FaLock />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                placeholder="Confirm new password"
                required
              />
              <div className="absolute right-3 top-3 text-gray-500">
                <FaLock />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 focus:outline-none"
          >
            Reset Password
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/signin"
            className="text-sm text-blue-900 hover:underline block"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
