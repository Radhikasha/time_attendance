import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import PropertyList from './components/PropertyList';
import PropertyDetails from './components/PropertyDetails';
import AddProperty from './components/AddProperty';
import EditProperty from './components/EditProperty';
import ClientManager from './components/ClientManager';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';

// Layout Component
const Layout = ({ children }) => (
  <>
    <Navbar />
    <div className="main-content">
      {children}
    </div>
  </>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      // Simulate API call to check auth
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Navigate to="/dashboard" replace />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/properties"
            element={
              <ProtectedRoute>
                <Layout>
                  <PropertyList />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/properties/add"
            element={
              <ProtectedRoute>
                <Layout>
                  <AddProperty />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/properties/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <PropertyDetails />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/properties/edit/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <EditProperty />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <Layout>
                  <ClientManager />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
