import React, { useState } from 'react';
import { FaEnvelope } from 'react-icons/fa';
import Logo from '../assets/sukkur-iba-logo.jpg'; // Import the logo
import axios from 'axios'; // Import axios for API calls

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (email) {
        console.log("email", email);
        
      try {
        // Make an API call to request password reset
        const response = await axios.post('http://localhost:3000/auth/forgot-password', { email });

        if (response.data.success) {
          setSuccess(response.data.message); // Display success message
          setError(''); // Clear error
        } else {
          setError(response.data.message || 'Something went wrong. Please try again.'); // Display error
        }
      } catch (err) {
        setError('An error occurred. Please try again later.'); // Display error if the request fails
        setSuccess(''); // Clear success message
      }
    } else {
      alert('Please enter your email address.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-lg p-8">
        {/* Logo at the top */}
        <div className="flex justify-center mb-6">
          <img src={Logo} alt="Sukkur IBA Logo" className="h-12" />
        </div>

        <h2 className="text-3xl font-bold text-center text-blue-900 mb-8">Forgot Password</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}

        <form onSubmit={handleForgotPassword}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                placeholder="Enter your email"
                required
              />
              <div className="absolute right-3 top-3 text-gray-500">
                <FaEnvelope />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 focus:outline-none"
          >
            Send Reset Link
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

export default ForgotPassword;
