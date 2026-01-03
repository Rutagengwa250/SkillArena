// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Gamepad2, 
  Trophy, 
  Users, 
  Zap, 
  Shield, 
  TrendingUp,
  Coins,
  Sparkles,
  ArrowRight,
  Star,
  Lock,
  Clock,
  Crown,
  Target,
  Brain,
  Dice5,
  Puzzle,
  Grid3x3,
  Target as TargetIcon,
  Brain as BrainIcon,
  Puzzle as PuzzleIcon,
  SquareStack as SquareStackIcon,
  Cpu as CpuIcon
} from "lucide-react";
import { statsService } from '../services/statsService.js';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalMatches: 1256,
    activePlayers: 342,
    totalWon: 48920,
    onlineNow: 87
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  // Game cover images (Unsplash links - high quality game images)
  const gameCovers = {
    "tic-tac-toe": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXvq2rEyesaz_B6TysTriBYTG_dSiFzcfbSg&s",
    "DLS":"https://scontent.fkgl2-1.fna.fbcdn.net/v/t39.30808-6/594776634_1256005099906658_3885902162904898742_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=86c6b0&_nc_ohc=EFSJeYwIlQcQ7kNvwGEaKKh&_nc_oc=AdlvuqerHaPchteFlVj5hMFQzCIlwpJM198n8_kDEW7rArpmmlAOxXzz0GydY8cWmVQ&_nc_zt=23&_nc_ht=scontent.fkgl2-1.fna&_nc_gid=CU9Ael-jPDj2ICezy0rZUw&oh=00_AfrGskzMEt7l_W7KBFTlZSEd3DMb8Z04noeQfHyG9GeE7g&oe=695C4C39",
    "8 Ball": "https://gamesbymanuel.com/wp-content/uploads/2014/07/8bp_header.jpg?w=1100",   
    "dice-duel": "https://img.freepik.com/free-vector/3d-rendering-dices-illustration_52683-75998.jpg?semt=ais_hybrid&w=740&q=80",
    "Call of duty": "https://i.guim.co.uk/img/media/8881b00713cea1b6d3ee22869e815c850aa5767f/2327_0_10239_6150/master/10239.jpg?width=1200&quality=85&auto=format&fit=max&s=e73eb54e09f53634436bdc7c8bae3b73",
    "LUDO": "https://mir-s3-cdn-cf.behance.net/projects/404/57a510174757983.Y3JvcCw4MjYsNjQ2LDAsODk.png"
  };

  const games = [
    {
      id: "tic-tac-toe",
      title: "Tic-Tac-Toe",
      description: "Classic 3x3 strategy game. Outsmart your opponent to get three in a row.",
      icon: <Grid3x3 className="w-8 h-8" />,
      status: "available",
      players: "1v1",
      difficulty: "Easy",
      minStake: 10,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      category: "Strategy",
      available: true,
      coverImage: gameCovers["tic-tac-toe"]
    },
    {
      id: "DLS",
      title: "DLS",
      description: "Master tactics, upgrade players, and prove your football skills in Dream League Soccer.",
      icon: <CpuIcon className="w-8 h-8" />,
      status: "coming-soon",
      players: "1v1",
      difficulty: "Expert",
      minStake: 50,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-200 dark:border-purple-800",
      category: "Strategy",
      available: false,
      coverImage: gameCovers["DLS"]
    },
    {
      id: "8 Ball",
      title: "8 Ball",
      description: "Show your precision and strategy in 8 Ball Pool. Sink balls, outplay opponents, and claim victory.",
      icon: <BrainIcon className="w-8 h-8" />,
      status: "coming-soon",
      players: "1v1",
      difficulty: "Medium",
      minStake: 20,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-green-500/10 to-emerald-500/10",
      borderColor: "border-green-200 dark:border-green-800",
      category: "Strategy",
      available: false,
      coverImage: gameCovers["8 Ball"]
    },
    {
      id: "dice-duel",
      title: "Dice Duel",
      description: "Roll the dice and outscore your opponent in this game of chance.",
      icon: <Dice5 className="w-8 h-8" />,
      status: "coming-soon",
      players: "1v1",
      difficulty: "Easy",
      minStake: 15,
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-gradient-to-br from-yellow-500/10 to-amber-500/10",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      category: "Luck",
      available: false,
      coverImage: gameCovers["dice-duel"]
    },
    {
      id: "Call of Duty",
      title: "Call of Duty",
      description: "Enter the battlefield, lock your aim, and survive the fight in Call of Duty.",
      icon: <PuzzleIcon className="w-8 h-8" />,
      status: "coming-soon",
      players: "1v1",
      difficulty: "Medium",
      minStake: 25,
      color: "from-red-500 to-orange-500",
      bgColor: "bg-gradient-to-br from-red-500/10 to-orange-500/10",
      borderColor: "border-red-200 dark:border-red-800",
      category: "Strategy",
      available: false,
      coverImage: gameCovers["Call of duty"]
    },
    {
      id: "LUDO",
      title: "LUDO",
      description: "Strategic grid game. Connect four of your pieces to win.",
      icon: <SquareStackIcon className="w-8 h-8" />,
      status: "coming-soon",
      players: "1v1",
      difficulty: "Medium",
      minStake: 30,
      color: "from-indigo-500 to-violet-500",
      bgColor: "bg-gradient-to-br from-indigo-500/10 to-violet-500/10",
      borderColor: "border-indigo-200 dark:border-indigo-800",
      category: "Strategy",
      available: false,
      coverImage: gameCovers["LUDO"]
    }
  ];

  const features = [
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Competitive Gaming",
      description: "Play against skilled opponents and climb the leaderboards",
      color: "from-yellow-500 to-amber-500"
    },
    {
      icon: <Coins className="w-6 h-6" />,
      title: "Cross-Game Tokens",
      description: "Earn tokens in one game, spend them in any game",
      color: "from-emerald-500 to-green-500"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Unified Platform",
      description: "One account for all games, single wallet system",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Skill Based",
      description: "Your skill determines your earnings across all games",
      color: "from-purple-500 to-pink-500"
    }
  ];

  const handleGameSelect = (game) => {
    if (game.available) {
      navigate("/matches");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-accent-purple/10 to-accent-pink/10 dark:from-primary-500/5 dark:via-accent-purple/5 dark:to-accent-pink/5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 via-accent-purple to-accent-pink flex items-center justify-center animate-float">
                  <Gamepad2 className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent-amber animate-pulse flex items-center justify-center">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-600 via-accent-purple to-accent-pink bg-clip-text text-transparent bg-300% animate-gradient">
                Skill Arena Pro
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              The ultimate multi-game competitive platform. Master multiple games, 
              earn unified rewards, and become the ultimate gaming champion.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {user ? (
                <>
                  <button
                    onClick={() => navigate("/matches")}
                    className="group px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-purple text-white font-bold rounded-xl hover:from-primary-700 hover:to-accent-purple/90 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2"
                  >
                    Play Tic-Tac-Toe
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate("/wallet")}
                    className="px-8 py-4 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700 transition-all"
                  >
                    View Wallet
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/register")}
                    className="group px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-purple text-white font-bold rounded-xl hover:from-primary-700 hover:to-accent-purple/90 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2"
                  >
                    Start Free Journey
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="px-8 py-4 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700 transition-all"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Games Grid Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Game Collection
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Play one, master all. Unified rewards across every game.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game, index) => (
              <div
                key={game.id}
                className={`group relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl 
                  ${game.borderColor} 
                  ${game.available 
                    ? 'bg-white dark:bg-dark-800 cursor-pointer hover:scale-[1.02]' 
                    : 'bg-gray-50 dark:bg-dark-900/50 cursor-not-allowed'
                  }`}
                onClick={() => handleGameSelect(game)}
              >
                {/* Game Cover Image */}
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={game.coverImage} 
                    alt={game.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Dark overlay for better text visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  
                  {/* Game Status Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    {game.available ? (
                      <div className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/80 text-green-800 dark:text-green-300 rounded-full text-xs font-medium backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        Available
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/80 text-purple-800 dark:text-purple-300 rounded-full text-xs font-medium backdrop-blur-sm">
                        <Clock className="w-3 h-3" />
                        Coming Soon
                      </div>
                    )}
                  </div>

                  {/* Game Title on Cover */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-12 h-12 rounded-xl ${game.bgColor} flex items-center justify-center backdrop-blur-md border border-white/20`}>
                        <div className={`bg-gradient-to-br ${game.color} bg-clip-text text-transparent`}>
                          {game.icon}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                          {game.title}
                        </h3>
                        <div className="flex items-center gap-2 text-white/90 text-sm">
                          <span className="px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                            {game.category}
                          </span>
                          <span>•</span>
                          <span>{game.players}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Game Info */}
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {game.description}
                  </p>

                  {/* Game Details */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Difficulty</span>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${game.difficulty === 'Easy' ? 'bg-green-500' : game.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{game.difficulty}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Min Stake</span>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{game.minStake} tokens</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    className={`w-full py-3 rounded-xl font-medium transition-all ${
                      game.available
                        ? 'bg-gradient-to-r from-primary-600 to-accent-purple text-white hover:from-primary-700 hover:to-accent-purple/90'
                        : 'bg-gray-200 dark:bg-dark-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!game.available}
                  >
                    {game.available ? (
                      <div className="flex items-center justify-center gap-2">
                        Play Now
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Lock className="w-4 h-4" />
                        Coming Soon
                    </div>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { 
                label: "Total Matches", 
                value: stats.totalMatches.toLocaleString(),
                icon: <Gamepad2 className="w-5 h-5" />,
                color: "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
              },
              { 
                label: "Active Players", 
                value: stats.activePlayers.toLocaleString(),
                icon: <Users className="w-5 h-5" />,
                color: "bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400"
              },
              { 
                label: "Tokens Won", 
                value: stats.totalWon.toLocaleString(),
                icon: <Coins className="w-5 h-5" />,
                color: "bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
              },
              { 
                label: "Online Now", 
                value: stats.onlineNow,
                icon: <Zap className="w-5 h-5" />,
                color: "bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400"
              }
            ].map((stat, index) => (
              <div 
                key={index}
                className="bg-white/50 dark:bg-dark-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-dark-700 hover:shadow-lg transition-all hover:scale-105 animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Skill Arena Pro?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              One platform, multiple games, unlimited possibilities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-200 dark:border-dark-700 hover:border-transparent transition-all hover:shadow-2xl hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-accent-purple to-accent-pink"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1531816458010-fb768453ea86?auto=format&fit=crop&w=1920')] opacity-10 mix-blend-overlay"></div>
            
            {/* Content */}
            <div className="relative p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Master Multiple Games?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Start with Tic-Tac-Toe today and be the first to play our upcoming games. 
                Your skills and rewards carry over across all games!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <button
                    onClick={() => navigate("/matches")}
                    className="px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Play Tic-Tac-Toe Now
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/register")}
                      className="px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                    >
                      Join Platform Free
                    </button>
                    <button
                      onClick={() => navigate("/login")}
                      className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </div>
              
              <div className="mt-8 flex items-center justify-center gap-2 text-white/80">
                <Star className="w-4 h-4" />
                <span className="text-sm">One account for all games • Unified wallet system</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-dark-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-purple flex items-center justify-center">
                <Gamepad2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Skill Arena Pro
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {games.filter(g => g.available).length} games available • {games.length - games.filter(g => g.available).length} coming soon
              </span>
            </div>
            
            <div className="mt-4 md:mt-0 text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Skill Arena Pro. All games, one platform.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;