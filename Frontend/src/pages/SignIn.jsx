import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Toggle for password visibility
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signIn } = useAuth(); // Access the signIn function from the context
  const navigate = useNavigate(); // Use navigate for redirection

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
  
    if (email && password) {
      const response = await signIn(email, password); // Use the signIn function from AuthContext
  
      if (response.success) {
        setSuccess('Sign In successful!');
        setError('');
  
        // Accessing user data from response.data.user
        const userRole = response.data.data.user.role;
        setTimeout(() => {
          navigate(`/${userRole.toLowerCase()}dashboard`);
        }, 2000);
      } else {
        setError(response.message); // Display error message from the response
      }
    } else {
      alert('Please enter valid credentials.');
    }
  };
  
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-lg p-8">
        <h2 className="text-3xl font-bold text-center text-teal-600 mb-8">Sign In</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}
        <form onSubmit={handleSignInSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-6 relative">
            <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-teal-500 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 focus:outline-none"
          >
            Sign In
          </button>
        </form>
        <div className="mt-6 text-center">
          <a
            href="#"
            onClick={() => alert('Forgot Password flow triggered!')}
            className="text-sm text-teal-500 hover:underline block"
          >
            Forgot Password?
          </a>
          <p className="text-sm text-gray-600 mt-2">
            Don’t have an account?{' '}
            <a href="/signup" className="text-teal-600 font-medium hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
