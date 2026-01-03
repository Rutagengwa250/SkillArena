// src/pages/admin/AdminUsers.jsx
import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Shield,
  ShieldOff,
  Mail,
  Clock,
  DollarSign,
  TrendingUp,
  X,
  Check,
  AlertCircle,
  RefreshCw
} from "lucide-react";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    isActive: true,
    isVerified: true
  });

  const fetchUsers = async (pageNum = 1, searchTerm = "") => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `http://localhost:5000/api/admin/users?page=${pageNum}&limit=20&search=${searchTerm}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.totalPages);
        setPage(data.page);
      } else {
        setError(data.error || "Failed to load users");
      }
    } catch (err) {
      setError("Cannot connect to server");
      console.error("Users error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1, search);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      isActive: user.isActive,
      isVerified: user.isVerified
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `http://localhost:5000/api/admin/users/${selectedUser.id}`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(editForm)
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update local state
        setUsers(users.map(u => 
          u.id === selectedUser.id ? { ...u, ...editForm } : u
        ));
        setShowEditModal(false);
        setSelectedUser(null);
      } else {
        setError(data.error || "Failed to update user");
      }
    } catch (err) {
      setError("Cannot connect to server");
      console.error("Update error:", err);
    }
  };

  const getStatusBadge = (user) => {
    if (!user.isActive) {
      return { text: "Banned", color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300" };
    }
    if (!user.isVerified) {
      return { text: "Unverified", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300" };
    }
    return { text: "Active", color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" };
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all user accounts and permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchUsers(page, search)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
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
                placeholder="Search by username or email..."
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
            <button className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Balance</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Matches</th>
                <th className="px6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No users found</p>
                      <p className="text-sm mt-1">Try a different search term</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const status = getStatusBadge(user);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                            <span className="text-white font-bold">{user.username?.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="font-bold text-gray-900 dark:text-white">
                            {user.balance.toLocaleString()}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">tokens</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="font-medium">{user.totalMatches}</span>
                            <span className="text-gray-500 dark:text-gray-400">played</span>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.totalWins || 0} wins
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {user.isActive ? (
                            <Shield className="w-3 h-3 mr-1" />
                          ) : (
                            <ShieldOff className="w-3 h-3 mr-1" />
                          )}
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchUsers(page - 1, search)}
                  disabled={page === 1 || loading}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchUsers(page + 1, search)}
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

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit User</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{selectedUser.username?.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedUser.username}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Account Active
                    </span>
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-7">
                    If disabled, user cannot login or play matches
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={editForm.isVerified}
                      onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Email Verified
                    </span>
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-7">
                    Verification status for security features
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateUser}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;