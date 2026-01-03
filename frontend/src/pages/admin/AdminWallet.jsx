// src/pages/admin/AdminWallet.jsx
import React, { useState, useEffect } from "react";
import {
  Wallet,
  TrendingUp,
  DollarSign,
  Download,
  Upload,
  RefreshCw,
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  AlertCircle
} from "lucide-react";

const AdminWallet = () => {
  const [walletData, setWalletData] = useState({
    balance: 0,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("month");

  const timeRanges = [
    { id: "day", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "year", label: "This Year" },
    { id: "all", label: "All Time" }
  ];

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        "http://localhost:5000/api/admin/platform-wallet",
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setWalletData({
          balance: data.wallet.balance,
          recentTransactions: data.recentTransactions || []
        });
      } else {
        setError(data.error || "Failed to load wallet data");
      }
    } catch (err) {
      setError("Cannot connect to server");
      console.error("Wallet error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  // Calculate stats
  const calculateStats = () => {
    const transactions = walletData.recentTransactions;
    const totalIncome = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalOutgoing = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const platformFees = transactions
      .filter(t => t.type === "PLATFORM_FEE")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalOutgoing,
      platformFees,
      transactionCount: transactions.length
    };
  };

  const stats = calculateStats();

  const transactionTypes = {
    "PLATFORM_FEE": { label: "Platform Fee", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300" },
    "WIN": { label: "Player Win", color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" },
    "STAKE": { label: "Stake", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300" },
    "REFUND": { label: "Refund", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300" }
  };

  if (loading && walletData.balance === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Platform Wallet</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor platform earnings and transactions
          </p>
        </div>
        <button
          onClick={fetchWalletData}
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

      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm opacity-90">Platform Balance</p>
            <h2 className="text-4xl font-bold mt-2">
              {walletData.balance.toLocaleString()} tokens
            </h2>
            <p className="text-sm opacity-90 mt-2">
              Total earnings from platform fees
            </p>
          </div>
          <Wallet className="w-16 h-16 opacity-80" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" />
              <p className="text-sm">Total Income</p>
            </div>
            <p className="text-xl font-bold">+{stats.totalIncome.toLocaleString()}</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="w-4 h-4" />
              <p className="text-sm">Platform Fees</p>
            </div>
            <p className="text-xl font-bold">+{stats.platformFees.toLocaleString()}</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4" />
              <p className="text-sm">Transactions</p>
            </div>
            <p className="text-xl font-bold">{stats.transactionCount}</p>
          </div>
        </div>
      </div>

      {/* Stats and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Income</h3>
              <ArrowUpRight className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              +{stats.totalIncome.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Total platform income</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Outgoing</h3>
              <ArrowDownRight className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              -{stats.totalOutgoing.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Total payments</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Net Profit</h3>
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {(stats.totalIncome - stats.totalOutgoing).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Current period</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Avg. Fee</h3>
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.platformFees > 0 ? Math.round(stats.platformFees / stats.transactionCount) : 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Average per transaction</p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Time Range</h3>
          <div className="space-y-2">
            {timeRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`w-full px-4 py-3 rounded-xl text-left transition-all ${
                  timeRange === range.id
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-700"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{range.label}</span>
                  {timeRange === range.id && (
                    <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Transactions</h3>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
                <Filter className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
                <Calendar className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Transaction</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {walletData.recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No transactions</p>
                      <p className="text-sm mt-1">Transactions will appear here</p>
                    </div>
                  </td>
                </tr>
              ) : (
                walletData.recentTransactions.map((transaction) => {
                  const typeInfo = transactionTypes[transaction.type] || { label: transaction.type, color: "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300" };
                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {transaction.description || `Transaction #${transaction.id}`}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {transaction.id}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`font-bold flex items-center gap-1 ${
                          transaction.amount > 0 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-red-600 dark:text-red-400"
                        }`}>
                          {transaction.amount > 0 ? "+" : ""}
                          {transaction.amount.toLocaleString()}
                          <span className="text-gray-500 dark:text-gray-400 text-sm">tokens</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-600 dark:text-gray-400">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                          {transaction.reference}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* View All Button */}
        {walletData.recentTransactions.length > 0 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <button className="w-full py-3 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl font-medium">
              View All Transactions →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWallet;