// src/pages/GameBoard.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGameState, makeMove, startGame } from "../services/gameService.js";
import { Trophy, X, Circle, Users, Clock, Coins, RefreshCw, Home, Moon, Sun, Crown, Frown, Meh } from "lucide-react";
import { payoutService } from '../services/payoutService.js';

const GameBoard = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(Array(9).fill(""));
  const [turn, setTurn] = useState("X");
  const [status, setStatus] = useState("waiting");
  const [loading, setLoading] = useState(true);
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [players, setPlayers] = useState([]);
  const [matchInfo, setMatchInfo] = useState(null);
  const [winner, setWinner] = useState(null);
  const [payout, setPayout] = useState(null);
  const [makingMove, setMakingMove] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (localStorage.getItem('darkMode') !== null) {
      return localStorage.getItem('darkMode') === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
    if (!matchId) {
      navigate("/matches");
      return;
    }

    fetchGameState();

    // Poll for updates
    const interval = setInterval(fetchGameState, 2000);
    
    return () => clearInterval(interval);
  }, [matchId, navigate]);

  const fetchGameState = async () => {
    try {
      const data = await getGameState(matchId);
      console.log("Game state data:", data);
      
      if (data.success && data.gameState) {
        const boardArray = data.gameState.board.split("");
        setBoard(boardArray.map(cell => cell === "-" ? "" : cell));
        
        setTurn(data.gameState.turn);
        setStatus(data.gameState.status);
        
        if (data.playerSymbol) {
          setPlayerSymbol(data.playerSymbol);
        }
        
        if (data.gameState.match?.participants) {
          setPlayers(data.gameState.match.participants);
        }
        
        if (data.gameState.match) {
          setMatchInfo(data.gameState.match);
        }
        
        if (data.gameState.status === "finished") {
          fetchGameResult();
        }
        
      } else if (data.message) {
        setStatus(data.message.includes("Waiting") ? "waiting" : "ready");
        if (data.match?.participants) {
          setPlayers(data.match.participants);
          setMatchInfo(data.match);
        }
      }
    } catch (err) {
      console.error("Error fetching game state:", err);
    } finally {
      setLoading(false);
    }
  };

const fetchGameResult = async () => {
  try {
    const result = await payoutService.getMatchResult(matchId);
    
    if (result.success) {
      setWinner(result.winner);
      
      // Check if payout needs to be processed
      if (!result.payout || !result.payout.paidOut) {
        try {
          const payoutResult = await payoutService.processMatchCompletion(matchId);
          
          if (payoutResult.success && payoutResult.payout) {
            setPayout(payoutResult.payout);
            
            // For draw, both players get refund
            if (result.isDraw) {
              // Trigger balance update for current user
              window.dispatchEvent(new CustomEvent('balance-updated'));
              
              // Update localStorage
              const userStr = localStorage.getItem('user');
              if (userStr) {
                const user = JSON.parse(userStr);
                user.balance = (user.balance || 0) + (matchInfo?.stake || 0);
                localStorage.setItem('user', JSON.stringify(user));
              }
            } else if (isCurrentUserWinner()) {
              // For winner, update with winnings
              window.dispatchEvent(new CustomEvent('balance-updated'));
              
              // Update localStorage
              const userStr = localStorage.getItem('user');
              if (userStr) {
                const user = JSON.parse(userStr);
                user.balance = (user.balance || 0) + payoutResult.payout.winnerAmount;
                localStorage.setItem('user', JSON.stringify(user));
              }
            }
            
            // Trigger global balance refresh
            window.dispatchEvent(new CustomEvent('refresh-balance'));
          }
        } catch (payoutErr) {
          console.error("Error processing payout:", payoutErr);
        }
      } else if (result.payout) {
        setPayout(result.payout);
      }
    }
  } catch (err) {
    console.error("Error fetching game result:", err);
  }
};

// Add useEffect to trigger balance update when match ends
useEffect(() => {
  if (status === "finished") {
    // Trigger balance refresh immediately
    window.dispatchEvent(new CustomEvent('balance-updated'));
    
    // Also schedule periodic refresh for 10 seconds
    const refreshInterval = setInterval(() => {
      window.dispatchEvent(new CustomEvent('refresh-balance'));
    }, 2000);
    
    // Clear after 10 seconds
    setTimeout(() => {
      clearInterval(refreshInterval);
    }, 10000);
  }
}, [status]);

// Add this function to check and update balance
const updateUserBalance = async () => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const balanceRes = await walletService.getBalance();
      
      if (balanceRes.success) {
        user.balance = balanceRes.balance;
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
  } catch (err) {
    console.error("Error updating user balance:", err);
  }
};

// Call updateUserBalance when match ends
useEffect(() => {
  if (status === "finished") {
    fetchGameResult();
    updateUserBalance();
    
    // Also update Navbar balance
    const event = new CustomEvent('balance-updated');
    window.dispatchEvent(event);
  }
}, [status]);

  const handleCellClick = async (index) => {
    if (status !== "ongoing" || board[index] !== "" || turn !== playerSymbol || makingMove) {
      return;
    }

    setMakingMove(true);
    try {
      await makeMove(matchId, index);
      
      const newBoard = [...board];
      newBoard[index] = playerSymbol;
      setBoard(newBoard);
      
      setTimeout(() => {
        fetchGameState();
        setMakingMove(false);
      }, 500);
      
    } catch (err) {
      console.error("Error making move:", err);
      setMakingMove(false);
    }
  };

  const handleStartGame = async () => {
    try {
      await startGame(matchId);
      setStatus("ongoing");
      fetchGameState();
    } catch (err) {
      console.error("Error starting game:", err);
    }
  };

  const handleRematch = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/matches/rematch/${matchId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.newMatchId) {
          navigate(`/game/${data.newMatchId}`);
        }
      }
    } catch (err) {
      console.error("Error creating rematch:", err);
    }
  };

  // Get current user
  const getCurrentUser = () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (err) {
      console.error("Error parsing user data:", err);
      return null;
    }
  };

  const currentUser = getCurrentUser();
  
  // Determine if current user is the winner
  const isCurrentUserWinner = () => {
    if (!currentUser || !winner || winner === "draw") return false;
    
    // Find the player with the winning symbol
    const winningPlayer = players.find(p => p.symbol === winner);
    return winningPlayer && winningPlayer.userId === currentUser.id;
  };

  // Determine if current user is the loser
  const isCurrentUserLoser = () => {
    if (!currentUser || !winner || winner === "draw") return false;
    
    // Find the player with the losing symbol
    const losingPlayer = players.find(p => p.symbol !== winner && p.symbol);
    return losingPlayer && losingPlayer.userId === currentUser.id;
  };

  // Get personalized result message
  const getResultMessage = () => {
    if (!winner) return null;
    
    if (winner === "draw") {
      return {
      title: "It's a Draw!",
      icon: <Meh className="w-12 h-12 text-gray-600 dark:text-gray-400" />,
      message: "Both players played exceptionally well!",
      bgColor: "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-dark-800/50 dark:to-dark-700/50",
      borderColor: "border-gray-300 dark:border-dark-600",
      textColor: "text-gray-800 dark:text-gray-200",
      isDraw: true
    };
    }
    
    if (isCurrentUserWinner()) {
      return {
        title: "🎉 You Won! 🎉",
        icon: <Crown className="w-12 h-12 text-yellow-500 animate-bounce" />,
        message: "Congratulations! You played brilliantly!",
        bgColor: "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/40 dark:to-amber-900/40",
        borderColor: "border-yellow-300 dark:border-yellow-600/50",
        textColor: "text-yellow-800 dark:text-yellow-200"
      };
    } else if (isCurrentUserLoser()) {
      return {
        title: "😔 You Lost",
        icon: <Frown className="w-12 h-12 text-gray-500 dark:text-gray-400" />,
        message: "Better luck next time! Practice makes perfect.",
        bgColor: "bg-gradient-to-r from-gray-50 to-slate-100 dark:from-dark-800/60 dark:to-dark-700/60",
        borderColor: "border-gray-300 dark:border-dark-600",
        textColor: "text-gray-700 dark:text-gray-300"
      };
    } else {
      // Spectator view or winner not determined
      return {
        title: `Winner: ${winner}!`,
        icon: <Trophy className="w-12 h-12 text-yellow-600 dark:text-yellow-400 animate-bounce-slow" />,
        message: `${winner} wins the match!`,
        bgColor: "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30",
        borderColor: "border-yellow-300 dark:border-yellow-700/50",
        textColor: "text-yellow-800 dark:text-yellow-300"
      };
    }
  };

  const renderCell = (cell, index) => {
    let lightBg = "bg-white";
    let lightText = "text-gray-800";
    let lightBorder = "border-gray-300";
    let lightHover = "hover:bg-gray-50";
    
    let darkBg = "dark:bg-dark-800";
    let darkText = "dark:text-gray-100";
    let darkBorder = "dark:border-dark-600";
    let darkHover = "dark:hover:bg-dark-700";
    
    if (cell === "X") {
      lightBg = "bg-gradient-to-br from-blue-50 to-blue-100";
      lightText = "text-blue-600";
      lightBorder = "border-blue-300";
      darkBg = "dark:bg-gradient-to-br dark:from-blue-900/30 dark:to-blue-800/30";
      darkText = "dark:text-blue-300";
      darkBorder = "dark:border-blue-700/50";
    } else if (cell === "O") {
      lightBg = "bg-gradient-to-br from-red-50 to-red-100";
      lightText = "text-red-600";
      lightBorder = "border-red-300";
      darkBg = "dark:bg-gradient-to-br dark:from-red-900/30 dark:to-red-800/30";
      darkText = "dark:text-red-300";
      darkBorder = "dark:border-red-700/50";
    }
    
    const isWinningCell = winner && (status === "finished" && cell === winner);
    
    if (isWinningCell) {
      lightBg = "bg-gradient-to-br from-yellow-50 to-yellow-100";
      lightBorder = "border-yellow-400";
      darkBg = "dark:bg-gradient-to-br dark:from-yellow-900/40 dark:to-amber-900/40";
      darkBorder = "dark:border-yellow-600/50";
    }
    
    return (
      <button
        key={index}
        onClick={() => handleCellClick(index)}
        disabled={status !== "ongoing" || cell !== "" || turn !== playerSymbol || makingMove}
        className={`
          ${lightBg} ${darkBg}
          ${lightText} ${darkText}
          ${lightBorder} ${darkBorder}
          border-2 transition-all duration-200
          text-5xl md:text-6xl font-bold
          flex items-center justify-center
          hover:shadow-lg dark:hover:shadow-dark-900/30 hover:scale-105 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
          ${isWinningCell ? 'animate-pulse ring-2 ring-yellow-400 dark:ring-yellow-500' : ''}
          ${cell === "" && status === "ongoing" && turn === playerSymbol ? 
            `cursor-pointer ${lightHover} ${darkHover}` : ''}
          rounded-xl
          transition-colors duration-200
        `}
        style={{ 
          height: "100px",
          minHeight: "100px",
          aspectRatio: "1/1"
        }}
      >
        {cell === "X" ? (
          <X className="w-12 h-12 md:w-16 md:h-16" />
        ) : cell === "O" ? (
          <Circle className="w-12 h-12 md:w-16 md:h-16" />
        ) : (
          <span className="opacity-0">_</span>
        )}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-950 dark:to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading game...</p>
        </div>
      </div>
    );
  }

  const resultMessage = getResultMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-950 dark:to-dark-900 p-4 md:p-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-purple dark:from-primary-400 dark:to-accent-purple bg-clip-text text-transparent">
              Tic-Tac-Toe Arena
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Match #{matchId}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors shadow-sm"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              )}
            </button>
            
            <button
              onClick={() => navigate("/matches")}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors shadow-sm"
            >
              <Home className="w-4 h-4" />
              Back to Lobby
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Panel - Game Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Match Card */}
            <div className="glass-effect dark:glass-effect-dark rounded-2xl shadow-lg dark:shadow-dark-900/30 p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Match Info</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  status === "waiting" ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200" :
                  status === "ready" ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200" :
                  status === "ongoing" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200" :
                  "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200"
                }`}>
                  {status.toUpperCase()}
                </div>
              </div>
              
              {matchInfo && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Coins className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-gray-700 dark:text-gray-300">Stake:</span>
                    <span className="font-bold text-lg text-gray-800 dark:text-gray-100">
                      {matchInfo.stake} tokens
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <span className="text-gray-700 dark:text-gray-300">Players:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {players.length}/2
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Players Card */}
            <div className="glass-effect dark:glass-effect-dark rounded-2xl shadow-lg dark:shadow-dark-900/30 p-6 animate-fade-in">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Players</h2>
              <div className="space-y-4">
                {players.map((player, index) => {
                  const isWinner = winner && player.symbol === winner;
                  const isCurrentUser = currentUser && player.userId === currentUser.id;
                  
                  return (
                    <div 
                      key={player.userId}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        isCurrentUser 
                          ? "bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700/50" 
                          : "bg-gray-50 dark:bg-dark-800/50"
                      } ${isWinner ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        player.symbol === "X" 
                          ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300" 
                          : "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300"
                      }`}>
                        {player.symbol}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 dark:text-gray-100 flex items-center gap-2">
                          {player.user?.username || `Player ${index + 1}`}
                          {isWinner && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {player.symbol} {isWinner && "🏆"}
                        </p>
                      </div>
                      {isCurrentUser && (
                        <span className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-200 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Game Controls */}
            <div className="glass-effect dark:glass-effect-dark rounded-2xl shadow-lg dark:shadow-dark-900/30 p-6 animate-fade-in">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Game Controls</h2>
              
              <div className="space-y-3">
                {status === "ready" && players.length === 2 && (
                  <button
                    onClick={handleStartGame}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 dark:hover:from-green-700 dark:hover:to-emerald-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md dark:shadow-emerald-900/30"
                  >
                    Start Game
                  </button>
                )}
                
                {status === "ongoing" && (
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-200 dark:border-blue-700/50">
                    <p className="text-gray-700 dark:text-gray-300 mb-2">Current Turn</p>
                    <div className={`text-3xl font-bold ${
                      turn === "X" ? "text-blue-600 dark:text-blue-300" : "text-red-600 dark:text-red-300"
                    }`}>
                      {turn}
                    </div>
                    {playerSymbol && turn === playerSymbol && (
                      <p className="text-green-600 dark:text-green-400 font-medium mt-2 animate-pulse">
                        Your turn! 🎮
                      </p>
                    )}
                  </div>
                )}
                
                {status === "finished" && (
                  <div className="space-y-3">
                    <button
                      onClick={handleRematch}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-700 dark:hover:from-purple-700 dark:hover:to-pink-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md dark:shadow-purple-900/30 flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Play Again
                    </button>
                    
                    <button
                      onClick={() => navigate("/matches")}
                      className="w-full py-3 bg-gradient-to-r from-gray-500 to-gray-700 dark:from-gray-700 dark:to-gray-800 text-white font-semibold rounded-lg hover:from-gray-600 hover:to-gray-800 dark:hover:from-gray-800 dark:hover:to-gray-900 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md dark:shadow-gray-900/30 flex items-center justify-center gap-2"
                    >
                      <Home className="w-4 h-4" />
                      Back to Lobby
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center Panel - Game Board */}
          <div className="lg:col-span-2">
            <div className="glass-effect dark:glass-effect-dark rounded-2xl shadow-xl dark:shadow-dark-900/30 p-6 md:p-8 animate-slide-in">
              {/* Game Status Banner */}
              {status === "waiting" && (
                <div className="mb-8 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border border-yellow-200 dark:border-yellow-700/50 rounded-xl">
                  <div className="flex items-center justify-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 animate-pulse" />
                    <p className="text-yellow-800 dark:text-yellow-300 font-medium">
                      Waiting for opponent to join...
                    </p>
                  </div>
                </div>
              )}
              
              {status === "finished" && resultMessage && (
                <div className="mb-8 animate-fade-in">
                  <div className={`p-6 rounded-xl text-center ${resultMessage.bgColor} border ${resultMessage.borderColor}`}>
                    <div className="flex flex-col items-center gap-4">
                      <div className="animate-bounce">
                        {resultMessage.icon}
                      </div>
                      <div>
                        <h3 className={`text-3xl font-bold mb-2 ${resultMessage.textColor}`}>
                          {resultMessage.title}
                        </h3>
                        <p className={`text-lg ${resultMessage.textColor} opacity-90`}>
                          {resultMessage.message}
                        </p>
                      </div>
                      
                      {/* Payout Information */}
                     {payout && payout.isDraw && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-200 dark:border-blue-700/50">
                              <div className="flex items-center justify-center gap-3">
                                <Coins className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <div>
                                  <p className="text-blue-800 dark:text-blue-300 font-bold text-xl">
                                    +{payout.refundAmount} tokens
                                  </p>
                                  <p className="text-blue-700 dark:text-blue-400 text-sm">
                                    Full stake refunded to both players!
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                      
                      {payout && winner !== "draw" && isCurrentUserLoser() && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 rounded-lg border border-red-200 dark:border-red-700/50">
                          <div className="flex items-center justify-center gap-3">
                            <Coins className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                            <div>
                              <p className="text-red-800 dark:text-red-300 font-bold text-xl">
                                -{matchInfo?.stake || 0} tokens
                              </p>
                              <p className="text-red-700 dark:text-red-400 text-sm">
                                Staked amount deducted
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Match Summary */}
                      <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-md mx-auto">
                        <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Winner</p>
                          <p className={`text-xl font-bold ${
                            winner === "X" ? "text-blue-600 dark:text-blue-300" : "text-red-600 dark:text-red-300"
                          }`}>
                            {winner === "draw" ? "Draw" : winner}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-800/20 dark:to-dark-700/20 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Moves</p>
                          <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                            {board.filter(cell => cell !== "").length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Game Board Grid */}
              <div className="mb-8">
                <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-md mx-auto">
                  {board.map((cell, index) => renderCell(cell, index))}
                </div>
              </div>

              {/* Game Instructions */}
              <div className="text-center">
                {status === "ongoing" && playerSymbol && turn === playerSymbol ? (
                  <p className="text-green-600 dark:text-green-400 font-medium animate-pulse">
                    Click on an empty cell to make your move!
                  </p>
                ) : status === "ongoing" ? (
                  <p className="text-blue-600 dark:text-blue-400">
                    Waiting for opponent's move...
                  </p>
                ) : status === "finished" ? (
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      {isCurrentUserWinner() 
                        ? "🎉 Celebrate your victory!" 
                        : isCurrentUserLoser()
                        ? "💪 Keep practicing and you'll win next time!"
                        : "Game over!"
                      }
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click "Play Again" for a rematch or "Back to Lobby" to find new opponents.
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    {status === "waiting" 
                      ? "Share the match ID with a friend to start playing!" 
                      : "Game controls are on the left panel"}
                  </p>
                )}
              </div>
            </div>

            {/* Game Stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-effect dark:glass-effect-dark rounded-xl p-4 shadow-lg dark:shadow-dark-900/30">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Your Symbol</p>
                <p className={`text-2xl font-bold ${
                  playerSymbol === "X" 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-red-600 dark:text-red-400"
                }`}>
                  {playerSymbol || "?"}
                </p>
              </div>
              
              <div className="glass-effect dark:glass-effect-dark rounded-xl p-4 shadow-lg dark:shadow-dark-900/30">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Moves</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {board.filter(cell => cell !== "").length}
                </p>
              </div>
              
              <div className="glass-effect dark:glass-effect-dark rounded-xl p-4 shadow-lg dark:shadow-dark-900/30">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Match Status</p>
                <p className={`text-lg font-bold ${
                  status === "ongoing" 
                    ? "text-blue-600 dark:text-blue-400" :
                  status === "finished" 
                    ? (isCurrentUserWinner() 
                        ? "text-green-600 dark:text-green-400" 
                        : isCurrentUserLoser()
                        ? "text-red-600 dark:text-red-400"
                        : "text-purple-600 dark:text-purple-400")
                    : "text-yellow-600 dark:text-yellow-400"
                }`}>
                  {status === "finished" 
                    ? (isCurrentUserWinner() ? "You Won!" : isCurrentUserLoser() ? "You Lost" : "Finished")
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>Made with ❤️ using React & Node.js | Skill Arena</p>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;