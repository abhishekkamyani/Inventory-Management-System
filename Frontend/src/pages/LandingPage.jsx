import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import Features from '../components/Features';
import Statistics from '../components/Statistics';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <HeroSection />
      <Features />
      
      <Footer />
    </div>
  );
};

export default LandingPage;
