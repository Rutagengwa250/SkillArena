// src/pages/Wallet.jsx
import React, { useEffect, useState, useContext } from "react";
import { 
  Coins, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet as WalletIcon,
  TrendingUp,
  History,
  RefreshCw,
  Download,
  Upload
} from "lucide-react";
import { walletService } from "../services/walletService.js";
import { BalanceContext } from "../App.jsx";

const Wallet = () => {
  // Use BalanceContext
  const { balance, refreshBalance, loading: balanceLoading } = useContext(BalanceContext);
  
  const [transactions, setTransactions] = useState([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [walletLoading, setWalletLoading] = useState(true); // Renamed to walletLoading
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setWalletLoading(true); // Use setWalletLoading
    setError("");
    setSuccess("");
    
    try {
      const transactionsRes = await walletService.getTransactions(10, 0);
      
      if (transactionsRes.success !== false) {
        setTransactions(transactionsRes.transactions || []);
      } else {
        setTransactions([]);
      }
      
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch transactions");
      console.error("Error fetching transactions:", err);
    } finally {
      setWalletLoading(false); // Use setWalletLoading
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || depositAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setWalletLoading(true); // Use setWalletLoading
      setError("");
      
      const result = await walletService.deposit(parseInt(depositAmount));
      
      setSuccess(result.message);
      setDepositAmount("");
      
      // IMPORTANT: Refresh global balance
      await refreshBalance();
      
      // Refresh transactions
      fetchTransactions();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Deposit failed");
      console.error("Deposit error:", err);
    } finally {
      setWalletLoading(false); // Use setWalletLoading
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (Number(withdrawAmount) > balance) {
      setError("Insufficient balance");
      return;
    }

    try {
      setWalletLoading(true); // Use setWalletLoading
      setError("");
      
      const result = await walletService.withdraw(parseInt(withdrawAmount));
      
      setSuccess(result.message);
      setWithdrawAmount("");
      
      // IMPORTANT: Refresh global balance
      await refreshBalance();
      
      // Refresh transactions
      fetchTransactions();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Withdrawal failed");
      console.error("Withdrawal error:", err);
    } finally {
      setWalletLoading(false); // Use setWalletLoading
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: <WalletIcon className="w-4 h-4" /> },
    { id: "transactions", label: "Transactions", icon: <History className="w-4 h-4" /> },
    { id: "deposit", label: "Deposit", icon: <Download className="w-4 h-4" /> },
    { id: "withdraw", label: "Withdraw", icon: <Upload className="w-4 h-4" /> },
  ];

  // Calculate loading state for the whole component
  const isLoading = walletLoading || balanceLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-800 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Wallet
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your tokens and track your transactions
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
            <p className="text-emerald-800 dark:text-emerald-200">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Balance & Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-primary-600 to-accent-purple rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm opacity-90">Total Balance</p>
                  <h2 className="text-4xl font-bold mt-2">
                    {isLoading ? "Loading..." : balance.toLocaleString()} tokens
                  </h2>
                </div>
                <Coins className="w-12 h-12 opacity-80" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpRight className="w-4 h-4" />
                    <p className="text-sm">Available</p>
                  </div>
                  <p className="text-xl font-bold">
                    {isLoading ? "..." : balance.toLocaleString()} tokens
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <p className="text-sm">Transactions</p>
                  </div>
                  <p className="text-xl font-bold">{transactions.length}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="border-b border-gray-200 dark:border-dark-700">
                <nav className="flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                      }`}
                      disabled={isLoading}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => setActiveTab("deposit")}
                        className="group p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                        disabled={isLoading}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-lg">
                            <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Deposit Tokens</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Add tokens to your wallet
                        </p>
                      </button>
                      
                      <button
                        onClick={() => setActiveTab("withdraw")}
                        className="group p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                        disabled={isLoading}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                            <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Withdraw Tokens</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Convert tokens to real money
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "deposit" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Deposit Tokens
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Amount to Deposit
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="Enter amount"
                            disabled={isLoading}
                          />
                          <div className="absolute left-4 top-3.5 text-gray-500 dark:text-gray-400">
                            <Coins className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {[100, 500, 1000, 2000, 5000, 10000].map((amount) => (
                          <button
                            key={amount}
                            onClick={() => setDepositAmount(amount)}
                            className={`py-2 rounded-lg border transition-all ${
                              depositAmount === amount.toString()
                                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                                : "border-gray-300 dark:border-dark-600 hover:border-primary-500 dark:hover:border-primary-500"
                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isLoading}
                          >
                            {amount.toLocaleString()}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={handleDeposit}
                        disabled={isLoading || !depositAmount}
                        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? "Processing..." : "Deposit Now"}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "withdraw" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Withdraw Tokens
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Amount to Withdraw
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            max={balance}
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder={`Max: ${balance.toLocaleString()}`}
                            disabled={isLoading}
                          />
                          <div className="absolute left-4 top-3.5 text-gray-500 dark:text-gray-400">
                            <Coins className="w-5 h-5" />
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Available balance: {isLoading ? "Loading..." : balance.toLocaleString()} tokens
                        </p>
                      </div>
                      
                      <button
                        onClick={handleWithdraw}
                        disabled={isLoading || !withdrawAmount || Number(withdrawAmount) > balance}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? "Processing..." : "Withdraw Now"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Recent Transactions */}
          <div className="space-y-6">
            {/* Recent Transactions */}
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
                <button
                  onClick={fetchTransactions}
                  disabled={isLoading}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-500 dark:text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading transactions...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No transactions yet
                  </p>
                ) : (
                  transactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          transaction.amount > 0 
                            ? "bg-green-100 dark:bg-green-900/20" 
                            : "bg-red-100 dark:bg-red-900/20"
                        }`}>
                          {transaction.amount > 0 ? (
                            <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={`font-bold ${
                        transaction.amount > 0 
                          ? "text-green-600 dark:text-green-400" 
                          : "text-red-600 dark:text-red-400"
                      }`}>
                        {transaction.amount > 0 ? "+" : ""}{transaction.amount.toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {transactions.length > 0 && (
                <button
                  onClick={() => setActiveTab("transactions")}
                  className="w-full mt-4 py-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                >
                  View All Transactions
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;