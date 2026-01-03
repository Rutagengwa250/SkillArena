// src/pages/Stats.jsx
import React, { useEffect, useState, useContext } from "react"; // Add useContext import
import { statsService } from "../services/statsService.js";
import { BalanceContext } from "../App.jsx"; // Import BalanceContext
import {
  Trophy,
  TrendingUp,
  Target,
  Clock,
  Award,
  Users,
  Coins,
  BarChart3,
  Medal,
  Crown,
  Sparkles
} from "lucide-react";

const Stats = () => {
  // Use BalanceContext for totalTokens
  const { balance: totalTokens, refreshBalance } = useContext(BalanceContext); // Use useContext here
  
  const [stats, setStats] = useState({
    totalMatches: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winRate: 0,
    totalEarned: 0,
    currentStreak: 0,
    bestStreak: 0,
    averageMatchTime: 4.2
  });
  
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [statsRes, achievementsRes] = await Promise.all([
        statsService.getPlayerStats(),
        statsService.getAchievements()
      ]);
      
      // Update stats
      if (statsRes.success !== false) {
        setStats({
          ...statsRes,
          // Use balance from context for totalTokens
          totalTokens: totalTokens
        });
      } else if (statsRes.offline) {
        // Use offline data
        setStats(statsRes);
      }
      
      // Handle achievements
      if (achievementsRes.achievements) {
        setAchievements(achievementsRes.achievements);
      } else if (Array.isArray(achievementsRes)) {
        setAchievements(achievementsRes);
      } else if (achievementsRes.offline) {
        setAchievements(achievementsRes.achievements || []);
      } else {
        setAchievements([]);
      }
      
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch stats");
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh stats when balance changes
  useEffect(() => {
    fetchStats();
  }, [totalTokens]);

  const timeRanges = [
    { id: "day", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "all", label: "All Time" },
  ];

  // Calculate actual winRate based on wins and totalMatches
  const calculatedWinRate = stats.totalMatches > 0 
    ? parseFloat(((stats.wins / stats.totalMatches) * 100).toFixed(1))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Player Statistics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your performance and achievements
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Time Range Selector */}
        <div className="mb-8">
          <div className="inline-flex bg-white dark:bg-dark-800 rounded-xl p-1 shadow-sm">
            {timeRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  timeRange === range.id
                    ? "bg-primary-500 text-white shadow"
                    : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-primary-500 to-accent-purple rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-sm opacity-90">Win Rate</p>
                <p className="text-2xl font-bold">{calculatedWinRate}%</p>
              </div>
            </div>
            <p className="text-sm opacity-90">Based on {stats.totalMatches} matches</p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tokens</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalTokens.toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Current balance</p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Coins className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Earned</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalEarned.toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">From matches</p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.currentStreak}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Best: {stats.bestStreak} wins
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Match Results */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Match Results
                </h3>
                <button
                  onClick={fetchStats}
                  disabled={loading}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <Sparkles className={`w-4 h-4 text-gray-500 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading stats...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Win/Loss/Draw Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-3">
                        <Trophy className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.wins}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Wins</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mx-auto mb-3">
                        <Target className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.losses}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Losses</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center mx-auto mb-3">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.draws}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Draws</p>
                    </div>
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">Win Rate</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{calculatedWinRate}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                          style={{ width: `${calculatedWinRate}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">Total Matches Progress</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {stats.totalMatches}/100
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary-500 to-accent-purple rounded-full"
                          style={{ width: `${Math.min(100, (stats.totalMatches / 100) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Achievements */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Achievements
                </h3>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading achievements...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        achievement.unlocked
                          ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10"
                          : "border-gray-200 dark:border-dark-700 bg-gray-50/50 dark:bg-dark-700/50 opacity-60"
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        achievement.unlocked
                          ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-gray-100 dark:bg-dark-600 text-gray-400 dark:text-gray-500"
                      }`}>
                        <span className="text-lg">{achievement.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          achievement.unlocked
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-600 dark:text-gray-400"
                        }`}>
                          {achievement.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {achievement.description}
                        </p>
                        <div className="mt-2">
                          <div className="h-1 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary-500 to-accent-purple rounded-full"
                              style={{ width: `${achievement.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      {achievement.unlocked && (
                        <div className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-xs rounded-full">
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {!loading && (
                <div className="mt-6 p-3 bg-gradient-to-r from-primary-50 to-accent-purple/10 dark:from-primary-900/10 dark:to-accent-purple/5 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                    {achievements.filter(a => a.unlocked).length} of {achievements.length} achievements unlocked
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;