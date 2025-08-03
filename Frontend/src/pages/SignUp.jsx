import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import logo from '../assets/sukkur-iba-logo.jpg';

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true);
        const response = await axios.get('http://localhost:3000/auth/get_roles');
        
        if (response.status === 200) {
          setRoles(response.data.roles);
          setFormData(prev => ({
            ...prev,
            role: response.data.roles[0] || ''
          }));
        } else {
          setError('Failed to load roles. Please refresh the page.');
        }
      } catch (err) {
        setError('Error loading roles. Please try again later.');
        console.error('Error fetching roles:', err);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();

    return () => {
      // Cleanup if needed
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('http://localhost:3000/auth/signup', formData);

      if (response.status === 201) {
        setSuccess('Sign Up successful! Please check your email to verify your account.');
        // Clear form on success
        setFormData({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: roles[0] || ''
        });
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } catch (err) {
      if (err.response) {
        if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Registration failed. Please try again.');
        }
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
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
        {error && (
          <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700">
            <p>{success}</p>
          </div>
        )}

        {/* Sign Up Form */}
        <form onSubmit={handleSignUpSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              placeholder="Enter your full name"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              placeholder="Enter your email"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                placeholder="Enter your password"
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-gray-600"
                disabled={isSubmitting}
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
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                placeholder="Confirm your password"
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-gray-600"
                disabled={isSubmitting}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Role</label>
            {rolesLoading ? (
              <div className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500">
                Loading roles...
              </div>
            ) : (
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                disabled={isSubmitting || rolesLoading}
              >
                {roles.map((role) => (
                  <option value={role} key={role}>
                    {role}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex justify-center items-center">
            <button
              type="submit"
              className={`px-8 py-3 text-white bg-blue-900 rounded-md hover:bg-blue-800 flex items-center justify-center min-w-32 ${
                isSubmitting ? 'opacity-75' : ''
              }`}
              disabled={isSubmitting || rolesLoading}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </div>
        </form>

        {/* Login Redirect */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <a
              href="/signin"
              className="text-blue-900 font-medium hover:underline"
            >
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;