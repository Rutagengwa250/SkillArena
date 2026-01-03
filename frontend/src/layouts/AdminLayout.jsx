// src/layouts/AdminLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  BarChart3,
  Users,
  Gamepad2,
  Wallet,
  Settings,
  LogOut,
  Home,
  Bell,
  Search,
  Shield,
  FileText,
  Moon,
  Sun,
  User
} from "lucide-react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [notifications] = useState(3);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || 
           window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const adminData = localStorage.getItem("admin");
    const token = localStorage.getItem("adminToken");
    
    if (!adminData || !token) {
      navigate("/admin/login");
      return;
    }
    
    setAdmin(JSON.parse(adminData));
  }, [navigate]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: <BarChart3 className="w-5 h-5" /> },
    { path: "/admin/users", label: "Users", icon: <Users className="w-5 h-5" /> },
    { path: "/admin/matches", label: "Matches", icon: <Gamepad2 className="w-5 h-5" /> },
    { path: "/admin/wallet", label: "Platform Wallet", icon: <Wallet className="w-5 h-5" /> },
    { path: "/admin/logs", label: "System Logs", icon: <FileText className="w-5 h-5" /> },
    { path: "/admin/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-all animate-fade-in"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 transition-all duration-300 ease-in-out
        ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}
        border-r transform lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3 animate-slide-in">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-purple flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-accent-purple bg-clip-text text-transparent">
                Skill Arena
              </h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                animate-fade-in
                ${isActive(item.path)
                  ? `bg-gradient-to-r from-primary-500/20 to-accent-purple/20 text-primary-600 dark:text-primary-400 border border-primary-300/30 dark:border-primary-700/30 shadow-sm`
                  : `${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'}`
                }
              `}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Admin Info */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          {admin && (
            <div className="flex items-center space-x-3 animate-slide-in">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center shadow-md">
                <span className="text-white font-bold">{admin.username?.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {admin.username}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {admin.role}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {darkMode ? (
                    <Sun className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <Moon className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b`}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left side - Title */}
              <div className="animate-slide-in">
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {navItems.find(item => isActive(item.path))?.label || 'Dashboard'}
                </h1>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {location.pathname === '/admin/dashboard' ? 'System Overview' : 'Administration'}
                </p>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative hidden md:block">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className={`w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    className={`pl-10 pr-4 py-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64
                      ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                  />
                </div>

                {/* Notifications */}
                <button className={`relative p-2 rounded-lg transition-colors ${darkMode ? 'text-gray-400 hover:text-primary-400 hover:bg-gray-800' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'}`}>
                  <Bell className="w-6 h-6" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {notifications}
                    </span>
                  )}
                </button>

                {/* Home Button */}
                <button
                  onClick={() => navigate("/")}
                  className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-gray-400 hover:text-primary-400 hover:bg-gray-800' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'}`}
                  title="Go to main site"
                >
                  <Home className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;