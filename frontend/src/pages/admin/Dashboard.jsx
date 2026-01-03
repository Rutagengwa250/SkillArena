// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { 
  Users, 
  Gamepad2, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Activity,
  Shield,
  Clock,
  BarChart3,
  Eye
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMatches: 0,
    activeMatches: 0,
    totalRevenue: 0,
    platformBalance: 0,
    newUsersToday: 0,
    successRate: 0,
    avgMatchDuration: 0,
    activeSessions: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("adminToken");
      
      // Fetch dashboard stats
      const response = await fetch("http://localhost:5000/api/admin/dashboard", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log("Dashboard API response:", data); // Debug log

      if (data.success) {
        // Handle different possible response structures
        const statsData = data.stats || data;
        
        setStats({
          totalUsers: statsData.totalUsers || 0,
          totalMatches: statsData.totalMatches || 0,
          activeMatches: statsData.activeMatches || 0,
          totalRevenue: statsData.totalRevenue || 0,
          platformBalance: statsData.platformBalance || 0,
          newUsersToday: statsData.newUsersToday || 0,
          successRate: statsData.successRate || 0,
          avgMatchDuration: statsData.avgMatchDuration || 0,
          activeSessions: statsData.activeSessions || 0
        });

        // Fetch recent activities/logs
        await fetchRecentActivities(token);
        
      } else {
        setError(data.error || "Failed to load dashboard data");
      }
    } catch (err) {
      setError("Cannot connect to server");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async (token) => {
    try {
      // Fetch recent admin logs
      const logsResponse = await fetch("http://localhost:5000/api/admin/logs?limit=5", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const logsData = await logsResponse.json();
      
      if (logsData.success && logsData.logs) {
        // Transform logs to activities format
        const activities = logsData.logs.map(log => ({
          id: log.id,
          user: log.admin || 'Admin',
          action: log.action,
          time: formatTimeAgo(new Date(log.createdAt)),
          type: getActivityType(log.action),
          details: log.details
        }));
        setRecentActivities(activities);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
      // Keep empty activities if API fails
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
  };

  const getActivityType = (action) => {
    if (action.includes('LOGIN') || action.includes('LOGOUT')) {
      return 'auth';
    } else if (action.includes('USER')) {
      return 'user';
    } else if (action.includes('MATCH') || action.includes('GAME')) {
      return 'match';
    } else if (action.includes('PAYOUT') || action.includes('WALLET')) {
      return 'finance';
    } else if (action.includes('SETTING')) {
      return 'admin';
    } else {
      return 'system';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "auth": return "text-blue-600 dark:text-blue-400";
      case "user": return "text-green-600 dark:text-green-400";
      case "match": return "text-purple-600 dark:text-purple-400";
      case "finance": return "text-yellow-600 dark:text-yellow-400";
      case "admin": return "text-red-600 dark:text-red-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "auth": return <Shield className="w-5 h-5" />;
      case "user": return <Users className="w-5 h-5" />;
      case "match": return <Gamepad2 className="w-5 h-5" />;
      case "finance": return <DollarSign className="w-5 h-5" />;
      case "admin": return <Activity className="w-5 h-5" />;
      default: return <BarChart3 className="w-5 h-5" />;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Platform overview and statistics
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</h3>
          <p className="text-gray-600 dark:text-gray-400">Total Users</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Gamepad2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMatches}</h3>
          <p className="text-gray-600 dark:text-gray-400">Total Matches</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeMatches}</h3>
          <p className="text-gray-600 dark:text-gray-400">Active Matches</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
              <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRevenue}</h3>
          <p className="text-gray-600 dark:text-gray-400">Total Revenue</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <ArrowDownRight className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.platformBalance}</h3>
          <p className="text-gray-600 dark:text-gray-400">Platform Balance</p>
        </div>
      </div>

      {/* Charts and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activities</h3>
            <button
              onClick={() => window.location.href = '/admin/logs'}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              View All →
            </button>
          </div>
          
          {recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No recent activities</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{activity.user}</p>
                      <p className={`text-sm ${getActivityColor(activity.type)}`}>{activity.action}</p>
                      {activity.details && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {JSON.stringify(activity.details)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">New Users Today</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.newUsersToday}</p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.successRate}%</p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Match Duration</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgMatchDuration} min</p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Sessions</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeSessions}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;