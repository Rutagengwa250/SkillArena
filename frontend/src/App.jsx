// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Wallet from './pages/Wallet.jsx';
import Stats from './pages/Stats.jsx';
import GameBoard from './pages/GameBoard.jsx';
import Match from './pages/Match.jsx'; 
import { walletService } from './services/walletService.js';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminMatches from './pages/admin/AdminMatches.jsx';
import AdminWallet from './pages/admin/AdminWallet.jsx';
import AdminLogs from './pages/admin/AdminLogs.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  const admin = localStorage.getItem("admin");
  
  if (!token || !admin) {
    return <Navigate to="/admin/login" />;
  }
  
  try {
    const adminData = JSON.parse(admin);
    if (!adminData.id) {
      throw new Error("Invalid admin data");
    }
  } catch (err) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    return <Navigate to="/admin/login" />;
  }
  
  return children;
};

// Create a Balance Context
export const BalanceContext = React.createContext({
  balance: 0,
  refreshBalance: () => {},
  loading: false
});

// Balance Provider Component
const BalanceProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const refreshBalance = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        
        const balanceRes = await walletService.getBalance();
        
        if (balanceRes.success !== false) {
          const newBalance = balanceRes.balance || balanceRes.balance === 0 ? balanceRes.balance : user.balance || 0;
          
          setBalance(newBalance);
          
          user.balance = newBalance;
          localStorage.setItem('user', JSON.stringify(user));
          
          setLastUpdated(Date.now());
        }
      }
    } catch (err) {
      console.error('Error refreshing balance:', err);
      
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setBalance(user.balance || 0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(refreshBalance, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refreshBalance();
  }, []);

  return (
    <BalanceContext.Provider value={{ balance, refreshBalance, loading, lastUpdated }}>
      {children}
    </BalanceContext.Provider>
  );
};

// Global event listener for balance updates
const GlobalBalanceListener = () => {
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'user') {
        window.dispatchEvent(new CustomEvent('user-data-changed'));
      }
    };

    const handleBalanceUpdateEvent = () => {
      window.dispatchEvent(new CustomEvent('refresh-balance'));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('balance-updated', handleBalanceUpdateEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('balance-updated', handleBalanceUpdateEvent);
    };
  }, []);

  return null;
};

// Component to conditionally render Navbar
const Layout = () => {
  const location = useLocation();
  
  // Hide Navbar on admin routes
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <>
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/matches" element={
          <ProtectedRoute>
            <Match />
          </ProtectedRoute>
        } />
        <Route path="/wallet" element={
          <ProtectedRoute>
            <Wallet />
          </ProtectedRoute>
        } />
        <Route path="/stats" element={
          <ProtectedRoute>
            <Stats />
          </ProtectedRoute>
        } />
        <Route path="/game/:matchId" element={
          <ProtectedRoute>
            <GameBoard />
          </ProtectedRoute>
        } />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="matches" element={<AdminMatches />} />
          <Route path="wallet" element={<AdminWallet />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </>
  );
};

function App() {
  return (
    <BalanceProvider>
      <Router>
        <GlobalBalanceListener />
        <Layout />
      </Router>
    </BalanceProvider>
  );
}

export default App;                   