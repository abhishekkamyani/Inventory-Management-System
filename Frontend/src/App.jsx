import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import LandingPage from './pages/LandingPage'; 
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import AdminDashboard from './pages/AdminDashboard';
function App() {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path='/signup' element={<SignUp/>} />
      <Route path='/signin' element={<SignIn/>} />
      <Route path='/signin/admindashboard' element={<AdminDashboard />} />
      
    </Routes>
  </Router>
  
  );
}

export default App;