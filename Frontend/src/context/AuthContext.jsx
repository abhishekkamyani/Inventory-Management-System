// eslint-disable-next-line no-unused-vars
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // User state
  const [loading, setLoading] = useState(true); // Loading state for persistent auth

  // signIn function 
  const signIn = async (email, password) => {
    try {
      const response = await axios.post("http://localhost:3000/auth/signin", {
        email,
        password,
      }, {withCredentials: true});
      setUser(response.data.data.user); // Set the user data from the backend
      return { success: true, data: response.data }; // Return the full response
    } catch (error) {
      console.error("Error signing in:", error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || "Login failed" };
    }
  };
  

  // Sign-out function
  const signOut = async () => {
    try {
      await axios.post("http://localhost:3000/auth/signout"); // Optional, if you handle signout on the backend
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error.response?.data?.message || error.message);
    }
  };

  // Fetch current user on app load
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get("http://localhost:3000/auth/currentUser", {
          withCredentials: true, // Required for sending cookies
        });
        setUser(response.data.data.user); // Set user data
      } catch (error) {
        console.error("Error fetching current user:", error.response?.data?.message || error.message);
      } finally {
        setLoading(false); // Stop loading
      }
    };
    fetchCurrentUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
