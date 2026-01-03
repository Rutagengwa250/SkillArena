// src/pages/admin/AdminLogs.jsx
import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  User,
  Clock,
  AlertCircle,
  Shield,
  Key,
  Trash2,
  Edit,
  Eye,
  X
} from "lucide-react";

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const actionTypes = [
    { value: "", label: "All Actions" },
    { value: "LOGIN", label: "Login" },
    { value: "LOGOUT", label: "Logout" },
    { value: "CREATE_USER", label: "Create User" },
    { value: "UPDATE_USER", label: "Update User" },
    { value: "DELETE_USER", label: "Delete User" },
    { value: "FORCE_PAYOUT", label: "Force Payout" },
    { value: "SYSTEM_EVENT", label: "System Event" }
  ];

  const fetchLogs = async (pageNum = 1, searchTerm = "") => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `http://localhost:5000/api/admin/logs?page=${pageNum}&limit=20`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setLogs(data.logs);
        setTotalPages(data.totalPages);
        setPage(data.page);
      } else {
        setError(data.error || "Failed to load logs");
      }
    } catch (err) {
      setError("Cannot connect to server");
      console.error("Logs error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs(1, search);
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const getActionColor = (action) => {
    switch (action) {
      case "LOGIN":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "LOGOUT":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      case "UPDATE_USER":
      case "CREATE_USER":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300";
      case "DELETE_USER":
      case "FORCE_PAYOUT":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300";
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "LOGIN":
      case "LOGOUT":
        return <Key className="w-4 h-4" />;
      case "UPDATE_USER":
      case "CREATE_USER":
      case "DELETE_USER":
        return <User className="w-4 h-4" />;
      case "FORCE_PAYOUT":
        return <Shield className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">System Logs</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Audit trail of all administrative actions
          </p>
        </div>
        <button
          onClick={() => fetchLogs(page, search)}
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

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearch} className="flex-1 w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by admin or action..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 px-4 text-primary-600 dark:text-primary-400 font-medium"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex items-center gap-2">
            <select className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              {actionTypes.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Admin</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Action</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Details</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Timestamp</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">IP Address</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No logs found</p>
                      <p className="text-sm mt-1">Administrative actions will appear here</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{log.admin?.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{log.admin}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {getActionIcon(log.action)}
                          <span className="ml-1">{log.action}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-900 dark:text-white truncate">
                          {typeof log.details === 'object' 
                            ? JSON.stringify(log.details)
                            : log.details || 'No details'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono text-gray-600 dark:text-gray-400">
                        {log.ipAddress || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(log)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {page} of {totalPages} • {logs.length} logs
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchLogs(page - 1, search)}
                  disabled={page === 1 || loading}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchLogs(page + 1, search)}
                  disabled={page === totalPages || loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {showDetailsModal && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Log Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Log Header */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Admin</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedLog.admin}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Action</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getActionColor(selectedLog.action)}`}>
                    {selectedLog.action}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Timestamp</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedLog.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">IP Address</p>
                  <p className="font-medium text-gray-900 dark:text-white font-mono">
                    {selectedLog.ipAddress || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Action Details</h4>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                  <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>

              {/* User Agent */}
              {selectedLog.userAgent && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">User Agent</h4>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedLog.userAgent}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Copy log details to clipboard
                    navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
                    alert('Copied to clipboard!');
                  }}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
                >
                  Copy Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogs;