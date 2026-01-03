// src/components/Navbar.jsx
import React, { useState, useEffect, useContext } from "react"; // Add useContext
import { Link, useNavigate } from "react-router-dom";
import { 
  Gamepad2, 
  Trophy, 
  Wallet, 
  BarChart3, 
  LogOut, 
  User,
  Menu,
  X,
  Home,
  Users,
  Coins,
  RefreshCw
} from "lucide-react";
import DarkModeToggle from "./DarkModeToggle.jsx";
import { walletService } from "../services/walletService.js";
import { BalanceContext } from "../App.jsx"; // Import BalanceContext

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshingBalance, setRefreshingBalance] = useState(false);
  
  // Use BalanceContext
  const { balance, refreshBalance, loading } = useContext(BalanceContext);

  useEffect(() => {
    // Load user from localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
    }

    // Listen for balance refresh events
    const handleRefreshBalance = () => {
      refreshBalance();
    };

    window.addEventListener('refresh-balance', handleRefreshBalance);

    return () => {
      window.removeEventListener('refresh-balance', handleRefreshBalance);
    };
  }, [refreshBalance]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/login");
  };

  const handleManualRefresh = async () => {
    setRefreshingBalance(true);
    await refreshBalance();
    setRefreshingBalance(false);
  };

  // Format balance for display
  const formatBalance = (bal) => {
    if (bal >= 1000000) {
      return `${(bal / 1000000).toFixed(1)}M`;
    } else if (bal >= 1000) {
      return `${(bal / 1000).toFixed(1)}K`;
    }
    return bal.toLocaleString();
  };

  const navLinks = [
    { to: "/", icon: <Home className="w-4 h-4" />, label: "Home" },
    { to: "/matches", icon: <Users className="w-4 h-4" />, label: "Matches" },
    { to: "/wallet", icon: <Wallet className="w-4 h-4" />, label: "Wallet" },
    { to: "/stats", icon: <BarChart3 className="w-4 h-4" />, label: "Stats" },
  ];

  const displayBalance = loading ? "Loading..." : formatBalance(balance);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-dark-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-dark-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-purple flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-amber animate-pulse"></div>
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-purple bg-clip-text text-transparent">
                  Skill Arena
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Compete. Win. Earn.</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-800 transition-all"
              >
                {link.icon}
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {/* Dark Mode Toggle */}
            <DarkModeToggle />
            
            {/* User Info */}
            {user ? (
              <>
                {/* Token Balance Display */}
                <div className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800">
                  <Coins className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300">
                        {displayBalance}
                      </span>
                      <button 
                        onClick={handleManualRefresh}
                        disabled={refreshingBalance || loading}
                        className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-800/30 rounded-full transition-colors"
                        title="Refresh balance"
                      >
                        <RefreshCw className={`w-3 h-3 ${refreshingBalance ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">tokens</span>
                  </div>
                </div>

                {/* User Profile */}
                <div className="hidden md:flex items-center space-x-3 px-4 py-2 rounded-lg bg-gray-100 dark:bg-dark-800">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center">
                    {user.username?.charAt(0).toUpperCase() || <User className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                      {user.username || "Player"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Level {Math.floor((user.totalMatches || 0) / 10) + 1}
                    </p>
                  </div>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden md:inline-flex items-center px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-800 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hidden md:inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-accent-purple text-white font-medium hover:from-primary-700 hover:to-accent-purple/90 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-dark-700 animate-slide-in">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-800 transition-all"
                >
                  {link.icon}
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
              
              {user ? (
                <>
                  {/* Mobile Token Balance */}
                  <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20">
                    <div className="flex items-center space-x-3">
                      <Coins className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Balance</p>
                        <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                          {displayBalance} tokens
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleManualRefresh}
                      disabled={refreshingBalance || loading}
                      className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-800/30 transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 ${refreshingBalance ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {/* Mobile User Profile */}
                  <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-800">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center">
                      {user.username?.charAt(0).toUpperCase() || <User className="w-5 h-5 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.username || "Player"}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Level {Math.floor((user.totalMatches || 0) / 10) + 1}
                        </p>
                        <Link
                          to="/wallet"
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          View Wallet →
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile Logout */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-800 transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-3 rounded-lg bg-gradient-to-r from-primary-600 to-accent-purple text-white font-medium hover:from-primary-700 hover:to-accent-purple/90 transition-all"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;