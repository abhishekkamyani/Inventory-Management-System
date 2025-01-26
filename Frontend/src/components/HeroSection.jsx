import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  const handleSignInClick = () => navigate('/signin');
  const handleSignUpClick = () => navigate('/signup');

  return (
    <div
      className="pt-16 mt-16 py-16 text-center mx-auto px-4 sm:px-6 lg:px-8 w-full"
      style={{
        background: 'linear-gradient(rgba(29, 78, 216, 0.1), rgba(30, 58, 138, 0.1))',
      }}
    >
      <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
        <span className="block">Welcome to the</span>
        <span className="block text-blue-900">SIBAU Inventory Hub</span>
      </h1>
      <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
        Streamline and manage campus resources efficiently with our comprehensive inventory tracking system for Kandhkot Campus.
      </p>
      <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
        <button
          onClick={handleSignInClick}
          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-900 hover:bg-blue-800 md:py-4 md:text-lg md:px-10"
        >
          Sign In
        </button>
        <button
          onClick={handleSignUpClick}
          className="mt-3 sm:mt-0 sm:ml-3 w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-900 hover:bg-blue-800 md:py-4 md:text-lg md:px-10"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default HeroSection;
