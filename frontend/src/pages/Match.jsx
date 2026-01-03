// src/pages/Match.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listMatches, createMatch, joinMatch } from "../services/matchService.js";
import MatchCard from "../components/MatchCard.jsx";

const Match = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [stake, setStake] = useState(100);
  const [matchCode, setMatchCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listMatches();
      console.log('Fetched matches:', data);
      
      // Handle both response formats
      let matchesArray = [];
      if (Array.isArray(data)) {
        matchesArray = data;
      } else if (data && data.matches && Array.isArray(data.matches)) {
        matchesArray = data.matches;
      } else if (data && data.success && Array.isArray(data.matches)) {
        matchesArray = data.matches;
      }
      
      setMatches(matchesArray || []);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError({
        title: "Connection Error",
        message: err.response?.data?.error || "Unable to fetch matches",
        type: "error"
      });
      setMatches([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreate = async () => {
    if (stake < 1) {
      setError({
        title: "Invalid Stake",
        message: "Stake amount must be at least 1",
        type: "warning"
      });
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      
      console.log('Creating match with stake:', stake);
      const result = await createMatch(stake, "tictactoe");
      
      // Handle different response formats
      const createdMatch = result.match || result;
      
      console.log('Match created successfully:', createdMatch);
      
      if (createdMatch && createdMatch.id) {
        // Store match data in session storage
        sessionStorage.setItem('currentMatch', JSON.stringify(createdMatch));
        
        // Navigate to game page immediately
        navigate(`/game/${createdMatch.id}`, {
          state: { 
            match: createdMatch,
            isCreator: true 
          }
        });
        
        // Show success message briefly before navigation
        setError({
          title: "Success!",
          message: `Match created! Redirecting to game...`,
          type: "success"
        });
        
        // Clear message after 2 seconds (if still on page)
        setTimeout(() => {
          setError(null);
        }, 2000);
      } else {
        // If no ID returned, just refresh list
        await fetchMatches();
        setStake(100);
        
        setError({
          title: "Success!",
          message: `Match created! Code: ${createdMatch.matchCode}. Share with opponent.`,
          type: "success"
        });
      }
    } catch (err) {
      console.error('Create match error:', err);
      
      const serverError = err.response?.data;
      setError({
        title: "Creation Failed",
        message: serverError?.error || serverError?.message || err.message || "Failed to create match",
        type: "error",
        details: serverError?.details
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async (code) => {
    const trimmedCode = code.toString().trim().toUpperCase();
    
    if (!trimmedCode || trimmedCode.length < 3) {
      setError({
        title: "Invalid Code",
        message: "Please enter a valid match code (at least 3 characters)",
        type: "warning"
      });
      return;
    }

    try {
      setIsJoining(true);
      setError(null);
      
      console.log('Attempting to join match:', trimmedCode);
      const result = await joinMatch(trimmedCode);
      
      // Handle different response formats
      const joinedMatch = result.match || result;
      
      console.log('Join match response:', joinedMatch);
      
      if (joinedMatch && joinedMatch.id) {
        // Store match data
        sessionStorage.setItem('currentMatch', JSON.stringify(joinedMatch));
        
        // Navigate to game page
        navigate(`/game/${joinedMatch.id}`, {
          state: { 
            match: joinedMatch,
            isCreator: false 
          }
        });
        
        // Show success message briefly
        setError({
          title: "Success!",
          message: `Joined match! Redirecting to game...`,
          type: "success"
        });
        
        // Clear message after 2 seconds
        setTimeout(() => {
          setError(null);
        }, 2000);
      } else {
        // If match joined but no ID (shouldn't happen), refresh list
        await fetchMatches();
        setMatchCode("");
        
        setError({
          title: "Joined!",
          message: `Successfully joined match ${trimmedCode}`,
          type: "success"
        });
      }
    } catch (err) {
      console.error('Join match error:', err);
      
      const serverError = err.response?.data;
      setError({
        title: "Join Failed",
        message: serverError?.error || serverError?.message || err.message || "Failed to join match",
        type: "error",
        details: serverError?.details
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  // Header Component
  const Header = () => (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-accent-purple p-8 mb-8 shadow-glow animate-gradient">
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
      <div className="relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 animate-fade-in">
          Tic-Tac-Toe Arena
        </h1>
        <p className="text-lg text-primary-100 opacity-90">
          Challenge opponents, stake tokens, and prove your strategy skills
        </p>
        <div className="flex flex-wrap items-center gap-4 mt-6">
          <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-800">
              {matches.length} Active Matches
            </span>
          </div>
          <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse-slow"></div>
            <span className="text-sm font-medium text-gray-800">
              Real-time Updates
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Error Display Component
  const ErrorDisplay = ({ error }) => {
    if (!error) return null;
    
    const bgColor = {
      error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
      success: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
      warning: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
    };
    
    const textColor = {
      error: "text-red-800 dark:text-red-200",
      success: "text-emerald-800 dark:text-emerald-200",
      warning: "text-amber-800 dark:text-amber-200"
    };

    const icon = {
      error: "❌",
      success: "✅",
      warning: "⚠️"
    };

    return (
      <div className={`mb-6 p-4 rounded-xl border ${bgColor[error.type]} animate-slide-in`}>
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon[error.type]}</span>
          <div className="flex-1">
            <h3 className={`font-semibold ${textColor[error.type]}`}>{error.title}</h3>
            <p className={`text-sm ${textColor[error.type]} opacity-90`}>{error.message}</p>
            {error.details && (
              <p className={`text-xs ${textColor[error.type]} opacity-70 mt-1`}>
                {error.details}
              </p>
            )}
          </div>
          <button 
            onClick={() => setError(null)}
            className={`${textColor[error.type]} hover:opacity-70 transition-opacity p-1`}
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  // Action Cards Component
  const ActionCards = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Create Match Card */}
      <div className="glass-effect dark:glass-effect-dark rounded-2xl p-6 shadow-lg hover-lift">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-md">
            <span className="text-2xl text-white">🎮</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Create Match</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Start a new game session</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stake Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={stake}
                min="1"
                max="10000"
                step="10"
                onChange={(e) => setStake(Math.max(1, Number(e.target.value) || 100))}
                className="w-full border border-gray-300 dark:border-dark-600 rounded-xl p-4 pl-12 bg-white dark:bg-dark-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                disabled={isCreating}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <span className="text-2xl">💰</span>
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                tokens
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleCreate}
            disabled={isCreating || loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {isCreating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Match...
              </>
            ) : (
              <>
                <span className="text-xl">⚡</span>
                Create Match
              </>
            )}
          </button>
        </div>
      </div>

      {/* Join Match Card */}
      <div className="glass-effect dark:glass-effect-dark rounded-2xl p-6 shadow-lg hover-lift">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center shadow-md">
            <span className="text-2xl text-white">🔗</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Join Match</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Enter a match code</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Match Code
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter match code (e.g., ABC123)"
                value={matchCode}
                onChange={(e) => setMatchCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                className="w-full border border-gray-300 dark:border-dark-600 rounded-xl p-4 pl-12 bg-white dark:bg-dark-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all tracking-widest text-lg font-mono"
                maxLength="8"
                disabled={isJoining}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <span className="text-2xl">🔑</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => handleJoin(matchCode)}
            disabled={isJoining || !matchCode.trim() || matchCode.length < 3}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {isJoining ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Joining Match...
              </>
            ) : (
              <>
                <span className="text-xl">🚀</span>
                Join Match
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Matches List Component
  const MatchesList = () => (
    <div className="glass-effect dark:glass-effect-dark rounded-2xl p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Available Matches
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Join an existing game or create your own
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-700 rounded-full">
            <div className={`w-2 h-2 rounded-full ${refreshing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></div>
            <span className="text-sm font-medium">
              {refreshing ? 'Updating...' : `${matches.length} matches`}
            </span>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-3 rounded-xl bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-700 transition-all hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh matches"
          >
            <span className={`text-xl ${refreshing ? 'animate-spin' : ''}`}>
              {refreshing ? '⟳' : '🔄'}
            </span>
          </button>
        </div>
      </div>

      {loading && !refreshing ? (
        <div className="py-16 text-center">
          <div className="inline-block relative">
            <div className="w-20 h-20 border-4 border-primary-200 dark:border-primary-800 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-primary-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium animate-pulse">
            Loading matches...
          </p>
        </div>
      ) : matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((match, index) => (
            <div 
              key={match.id || match.matchCode || index}
              className="animate-slide-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <MatchCard 
                match={match} 
                onJoin={() => handleJoin(match.matchCode)}
                disabled={isJoining}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-dark-700 dark:to-dark-800 flex items-center justify-center">
            <span className="text-4xl">🎲</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Active Matches
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Be the first to create a match! Set your stake and invite friends to play.
          </p>
          <button 
            onClick={handleCreate}
            disabled={isCreating}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-accent-purple text-white font-medium px-6 py-3 rounded-xl hover-lift shadow-lg shadow-primary-500/20 disabled:opacity-50"
          >
            <span>✨</span>
            Create First Match
          </button>
        </div>
      )}
    </div>
  );

  // Stats Component
  const Stats = () => (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="glass-effect dark:glass-effect-dark rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center">
            <span className="text-lg">🏆</span>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Staked</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {matches.reduce((sum, match) => sum + (match.stake || 0), 0)} tokens
            </p>
          </div>
        </div>
      </div>
      
      <div className="glass-effect dark:glass-effect-dark rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 flex items-center justify-center">
            <span className="text-lg">👥</span>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Players</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {matches.reduce((sum, match) => sum + (match.participants?.length || 0), 0)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="glass-effect dark:glass-effect-dark rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 flex items-center justify-center">
            <span className="text-lg">⚡</span>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Available Games</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {matches.filter(m => m.status === 'waiting').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-dark-950 dark:to-dark-900 p-4">
      <div className="max-w-7xl mx-auto">
        <Header />
        <ErrorDisplay error={error} />
        <ActionCards />
        <MatchesList />
        <Stats />
        
        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-dark-700 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p className="mb-2">
            Tic-Tac-Toe Arena • Built with React & Node.js
          </p>
          <div className="flex items-center justify-center gap-6">
            <span className="text-gray-400">•</span>
            <span>Create or join matches with tokens</span>
            <span className="text-gray-400">•</span>
            <span>Real-time gameplay</span>
            <span className="text-gray-400">•</span>
            <span>Auto-redirect to game</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Match;