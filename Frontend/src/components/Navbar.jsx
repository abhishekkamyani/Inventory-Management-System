import React from 'react';
import logo from '../assets/sukkur-iba-logo.jpg'; // Import the logo image from the assets folder

const Navbar = () => {
  return (
    <nav className="bg-white shadow fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center">
          <img src={logo} alt="SIBAU Logo" className="h-10 w-auto mr-2" /> {/* Use the imported logo */}
          <span className="text-lg font-semibold text-blue-900">SIBAU INVENTORY HUB</span>
        </div>
        
      </div>
    </nav>
  );
};

export default Navbar;
