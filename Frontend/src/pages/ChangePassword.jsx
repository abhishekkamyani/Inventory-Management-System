import React, { useState } from 'react';
import { FaLock } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import Logo from '../assets/sukkur-iba-logo.jpeg';
import axios from 'axios';

const ChangePassword = () => {
  const { id, token } = useParams(); // Extract `id` and `token` from URL
  const navigate = useNavigate();
  const [input, setInput] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (input.newPassword !== input.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await axios.post(`http://localhost:3000/auth/forgot-password/${id}/${token}`, {
        password: input.newPassword,
      });

      if (res.status === 200) {
        setSuccess('Password changed successfully!');
        setError('');
        setTimeout(() => navigate('/login'), 3000); // Redirect to login after success
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

        <h2 className="text-3xl font-bold text-center text-blue-900 mb-8">
          Change Password
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type="password"
                name="newPassword"
                value={input.newPassword}
                onChange={(e) =>
                  setInput({ ...input, [e.target.name]: e.target.value })
                }
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
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                name="confirmPassword"
                value={input.confirmPassword}
                onChange={(e) =>
                  setInput({ ...input, [e.target.name]: e.target.value })
                }
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
            Change Password
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-sm text-blue-900 hover:underline block"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
