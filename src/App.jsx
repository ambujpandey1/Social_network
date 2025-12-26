import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./pages/Dashboard";
import "./styles/global.css";

/**
 * Main App Component
 * - Manages authentication state
 * - Routes between Login, Signup, and Dashboard
 * - Handles logout
 */
function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  /**
   * Check if user is already logged in on app load
   */
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  /**
   * Handle successful login
   */
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentPage("dashboard");
  };

  /**
   * Handle successful signup
   */
  const handleSignupSuccess = () => {
    setCurrentPage("login");
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    setCurrentPage("login");
  };

  /**
   * Render based on authentication state
   */
  if (!isAuthenticated) {
    return (
      <div className="app-container">
        {currentPage === "login" ? (
          <div>
            <Login onLoginSuccess={handleLoginSuccess} />
            <div className="auth-switch">
              <p>
                Don't have an account?{" "}
                <button
                  onClick={() => setCurrentPage("signup")}
                  className="link-btn"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        ) : (
          <div>
            <Signup onSignupSuccess={handleSignupSuccess} />
            <div className="auth-switch">
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => setCurrentPage("login")}
                  className="link-btn"
                >
                  Login
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;
