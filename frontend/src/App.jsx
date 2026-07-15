import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import TripDashboard from './pages/TripDashboard';
import OfflineOverlay from './components/OfflineOverlay';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

function AppContent({ isServerOffline, setIsServerOffline }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      <Routes>
        {/* Public Routes — single combined auth page */}
        <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><AuthPage /></PublicRoute>} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/trips/:tripId" element={<ProtectedRoute><TripDashboard /></ProtectedRoute>} />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {isServerOffline && !isAuthPage && (
        <OfflineOverlay onOnline={() => setIsServerOffline(false)} />
      )}
    </>
  );
}

function App() {
  const [isServerOffline, setIsServerOffline] = useState(false);

  const checkInitialConnection = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/health`);
      if (!res.ok) {
        setIsServerOffline(true);
      } else {
        setIsServerOffline(false);
      }
    } catch (err) {
      setIsServerOffline(true);
    }
  };

  useEffect(() => {
    checkInitialConnection();
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/health`);
        if (!res.ok) {
          setIsServerOffline(true);
        } else {
          setIsServerOffline(false);
        }
      } catch (err) {
        setIsServerOffline(true);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppContent isServerOffline={isServerOffline} setIsServerOffline={setIsServerOffline} />
      </Router>
    </AuthProvider>
  );
}

export default App;
