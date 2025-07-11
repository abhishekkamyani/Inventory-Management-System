import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import logo from '../assets/sukkur-iba-logo.jpg';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
  // Allow scrolling on the body
  document.body.style.overflow = 'auto';

  let isMounted = true;
  let timer = null;

  const verifyEmailToken = async () => {
    const token = searchParams.get('token');
    
    if (!token) {
      if (isMounted) {
        setMessage('No verification token provided');
        setIsError(true);
      }
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3000/auth/verify-email?token=${token}`);
      
      if (isMounted) {
        if (response.status === 200) {
          setMessage(response.data.message);
          setIsError(false);
          // Start countdown for redirect
          timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                navigate('/signin');
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
    } catch (err) {
      if (isMounted) {
        const errorMessage = err.response?.data?.message || 'Error verifying email';
        setMessage(errorMessage);
        setIsError(true);
      }
    }
  };

  verifyEmailToken();

  // Cleanup function
  return () => {
    isMounted = false;
    if (timer) clearInterval(timer);
    document.body.style.overflow = 'auto';
  };
}, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 overflow-y-auto">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-lg p-8 mx-4 my-8" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex justify-center mb-6">
          <img src={logo} alt="SIBAU Logo" className="h-16 w-auto" />
        </div>
        
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-8">
          Email Verification
        </h2>
        
        <div className={`text-center text-lg p-4 rounded ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
        
        {!isError && (
          <div className="text-center mt-6">
            <p className="text-gray-600 mb-4">
              Redirecting to login page in {countdown} seconds...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${(3 - countdown) * 33.33}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail; 