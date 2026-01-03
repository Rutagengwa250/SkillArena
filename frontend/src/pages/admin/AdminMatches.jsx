// src/pages/admin/AdminMatches.jsx
import React, { useState, useEffect } from "react";
import {
  Gamepad2,
  Search,
  Filter,
  RefreshCw,
  Eye,
  DollarSign,
  Users,
  Trophy,
  X,
  Check,
  Clock,
  AlertCircle,
  TrendingUp
} from "lucide-react";

const AdminMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "waiting", label: "Waiting" },
    { value: "ready", label: "Ready" },
    { value: "ongoing", label: "Ongoing" },
    { value: "finished", label: "Finished" }
  ];

  const fetchMatches = async (pageNum = 1, status = "", searchTerm = "") => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `http://localhost:5000/api/admin/matches?page=${pageNum}&limit=20&status=${status}&search=${searchTerm}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setMatches(data.matches);
        setTotalPages(data.totalPages);
        setPage(data.page);
      } else {
        setError(data.error || "Failed to load matches");
      }
    } catch (err) {
      setError("Cannot connect to server");
      console.error("Matches error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMatches(1, statusFilter, search);
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    fetchMatches(1, status, search);
  };

  const handleViewDetails = async (match) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `http://localhost:5000/api/admin/matches/${match.id}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setSelectedMatch(data);
        setShowDetailsModal(true);
      } else {
        setError(data.error || "Failed to load match details");
      }
    } catch (err) {
      setError("Cannot connect to server");
      console.error("Details error:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "waiting": return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      case "ready": return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      case "ongoing": return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "finished": return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300";
      default: return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300";
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case "win": return "text-green-600 dark:text-green-400";
      case "loss": return "text-red-600 dark:text-red-400";
      case "draw": return "text-yellow-600 dark:text-yellow-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  if (loading && matches.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Match Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and manage all game matches
          </p>
        </div>
        <button
          onClick={() => fetchMatches(page, statusFilter, search)}
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
                placeholder="Search by match code..."
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
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <Gamepad2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No matches found</p>
              <p className="text-sm mt-1">Try a different search or filter</p>
            </div>
          </div>
        ) : (
          matches.map((match) => (
            <div
              key={match.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Match Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl">
                      <Gamepad2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">Match #{match.id}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{match.matchCode}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                    {match.status.toUpperCase()}
                  </span>
                </div>

                {/* Match Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <DollarSign className="w-4 h-4" />
                      <span>Stake:</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{match.stake} tokens</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>Players:</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {match.participants.length}/2
                    </span>
                  </div>

                  {match.result && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Trophy className="w-4 h-4" />
                        <span>Result:</span>
                      </div>
                      <span className={`font-bold ${getResultColor(match.result)}`}>
                        {match.winner ? `${match.winner} won` : 'Draw'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Match Footer */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    {new Date(match.createdAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => handleViewDetails(match)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
                  >
                    <Eye className="w-4 h-4" />
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {totalPages} • {matches.length} matches
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchMatches(page - 1, statusFilter, search)}
                disabled={page === 1 || loading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchMatches(page + 1, statusFilter, search)}
                disabled={page === totalPages || loading}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match Details Modal */}
      {showDetailsModal && selectedMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Match #{selectedMatch.match.id} Details
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Match Code</p>
                  <p className="font-medium">{selectedMatch.match.matchCode}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Stake</p>
                  <p className="font-medium">{selectedMatch.match.stake} tokens</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedMatch.match.status)}`}>
                    {selectedMatch.match.status.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Payout Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedMatch.match.paidOut ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'}`}>
                    {selectedMatch.match.paidOut ? 'Paid Out' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Participants */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Participants</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedMatch.participants.map((participant) => (
                    <div
                      key={participant.user.id}
                      className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                          <span className="text-white font-bold">{participant.user.username?.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{participant.user.username}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{participant.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Symbol</span>
                        <span className="font-bold text-lg">{participant.symbol}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Game Result */}
              {selectedMatch.gameResult && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Game Result</h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Result</p>
                        <p className={`text-xl font-bold ${getResultColor(selectedMatch.gameResult.result === 'draw' ? 'draw' : 'win')}`}>
                          {selectedMatch.gameResult.result === 'draw' ? 'Draw' : `${selectedMatch.gameResult.result} Wins`}
                        </p>
                      </div>
                      {selectedMatch.gameResult.winner && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Winner</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedMatch.gameResult.winner.username}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Game State */}
              {selectedMatch.gameState && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Game Board</h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                      {selectedMatch.gameState.board.split('').map((cell, index) => (
                        <div
                          key={index}
                          className="aspect-square flex items-center justify-center text-2xl font-bold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                        >
                          {cell === '-' ? '' : cell}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                      Current turn: <span className="font-bold">{selectedMatch.gameState.turn}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Moves History */}
              {selectedMatch.moves && selectedMatch.moves.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Move History</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedMatch.moves.map((move, index) => (
                      <div
                        key={move.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-sm font-bold">{move.symbol}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {move.user?.username || 'Player'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Position: {move.position}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Move #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMatches;