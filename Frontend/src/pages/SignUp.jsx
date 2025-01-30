import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from '../assets/sukkur-iba-logo.jpeg'; // Import the logo

const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {

    const fetchRoles = async () => {
      try {
        const response = await axios.get('http://localhost:3000/auth/get_roles');

        console.log(response);


        if (response.status === 200) {
          setRoles(response.data.roles);
          setRole(response.data.roles[0]);
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      } catch (err) {
        console.log(err);
      }
    }

    fetchRoles();

    return () => { };
  }, [])

  console.log("Roles:", roles);



  const navigate = useNavigate();



  const handleSignUpSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const data = {
      fullName,
      email,
      password,
      confirmPassword,
      role
    }

    try {
      const response = await axios.post('http://localhost:3000/auth/signup', data);

      if (response.status === 201) {
        setSuccess('Sign Up successful! Redirecting to login...');
        setError('');
        setTimeout(() => {
          navigate('/Signin'); // Navigate to login page after successful sign-up
        }, 2000);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Error connecting to the server. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-lg p-8">
        {/* Logo Section */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="SIBAU Logo" className="h-16 w-auto" />
        </div>

        {/* Form Heading */}
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-8">
          Create Your Account
        </h2>

        {/* Error and Success Messages */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}

        {/* Sign Up Form */}
        <form onSubmit={handleSignUpSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-gray-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-gray-600"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              {roles?.map((role) => (
                <option value={role} key={role}>{role}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-center items-center">
            <button
              type="submit"
              className="px-8 py-3 text-white bg-blue-900 rounded-md hover:bg-blue-800"
            >
              Sign Up
            </button>
          </div>
        </form>

        {/* Login Redirect */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <a href="/signin" className="text-blue-900 font-medium hover:underline">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
