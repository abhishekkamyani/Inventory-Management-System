import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import LandingPage from './pages/LandingPage'; 
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';

import FacultyDashboard from './pages/FacultyDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword1 from './pages/ResetPassword1';

function App() {
  return (
    
    <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path='/signup' element={<SignUp/>} />
      <Route path='/signin' element={<SignIn/>} />
      <Route path='/admindashboard' element={<AdminDashboard />} />
      <Route path='/staffdashboard' element={<StaffDashboard />} />
      <Route path='/facultydashboard' element={<FacultyDashboard />} />
      <Route path='/forgot-password' element={<ForgotPassword />} />
      <Route path='/reset-password/:token' element={<ResetPassword1/>} />
      
      
    </Routes>
  </Router>
  
  );
}

export default App;