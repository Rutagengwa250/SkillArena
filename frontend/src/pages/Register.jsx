// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService.js";
import { UserPlus, User, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");
      
      const data = await authService.register(name, email, password);
      
      // Store auth data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Show success message
      setError("success:Registration successful! Welcome to Tic-Tac-Toe Arena!");
      
      // Redirect after delay
      setTimeout(() => {
        navigate("/matches");
      }, 2000);
      
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const passwordStrength = getPasswordStrength();
  const strengthColors = [
    "bg-red-500 dark:bg-red-600",
    "bg-orange-500 dark:bg-orange-600",
    "bg-yellow-500 dark:bg-yellow-600",
    "bg-green-500 dark:bg-green-600"
  ];
  const strengthLabels = ["Very Weak", "Weak", "Good", "Strong"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-950 dark:to-dark-900 flex items-center justify-center p-4 transition-colors duration-300">
      

      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-purple mb-4">
            <UserPlus className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-purple dark:from-primary-400 dark:to-accent-purple bg-clip-text text-transparent">
            Join the Arena
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create your account and start playing!
          </p>
        </div>

        {/* Register Card */}
        <div className="glass-effect dark:glass-effect-dark rounded-2xl shadow-xl dark:shadow-dark-900/30 p-8 animate-fade-in">
          {error && (
            <div className={`mb-6 p-4 rounded-xl border ${
              error.startsWith("success:") 
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" 
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            }`}>
              <div className="flex items-start gap-3">
                {error.startsWith("success:") ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-600 dark:text-emerald-300">✓</span>
                  </div>
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                )}
                <p className={`text-sm ${
                  error.startsWith("success:") 
                    ? "text-emerald-800 dark:text-emerald-200" 
                    : "text-red-800 dark:text-red-200"
                }`}>
                  {error.replace("success:", "")}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Dominate"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Password strength:</span>
                    <span className={`font-medium ${
                      passwordStrength === 0 ? "text-red-600 dark:text-red-400" :
                      passwordStrength === 1 ? "text-orange-600 dark:text-orange-400" :
                      passwordStrength === 2 ? "text-yellow-600 dark:text-yellow-400" :
                      "text-green-600 dark:text-green-400"
                    }`}>
                      {strengthLabels[passwordStrength - 1] || "Very Weak"}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    {[0, 1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          index < passwordStrength 
                            ? strengthColors[passwordStrength - 1] 
                            : "bg-gray-200 dark:bg-dark-700"
                        }`}
                      />
                    ))}
                  </div>
                  <ul className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <li className={`flex items-center ${password.length >= 6 ? 'text-green-600 dark:text-green-400' : ''}`}>
                      {password.length >= 6 ? '✓' : '○'} At least 6 characters
                    </li>
                    <li className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                      {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
                    </li>
                    <li className={`flex items-center ${/[0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                      {/[0-9]/.test(password) ? '✓' : '○'} One number
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    password && confirmPassword && password !== confirmPassword
                      ? "border-red-300 dark:border-red-700"
                      : password && confirmPassword && password === confirmPassword
                      ? "border-green-300 dark:border-green-700"
                      : "border-gray-300 dark:border-dark-600"
                  }`}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
                  )}
                </button>
              </div>
              {password && confirmPassword && password === confirmPassword && (
                <p className="mt-1 text-sm text-green-600 dark:text-green-400">✓ Passwords match</p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-dark-600 rounded mt-1"
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                I agree to the{" "}
                <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-white font-medium bg-gradient-to-r from-primary-600 to-accent-purple hover:from-primary-700 hover:to-accent-purple-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-800 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Account
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-dark-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 dark:bg-dark-800 text-gray-500 dark:text-gray-400">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 border-2 border-primary-600 dark:border-primary-500 text-primary-600 dark:text-primary-400 font-medium rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-700 dark:hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-800 transition-all duration-300"
              >
                Sign In Instead
              </Link>
            </div>
          </form>
        </div>

        {/* Features List */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
            <div className="text-blue-600 dark:text-blue-400 text-lg mb-1">🎮</div>
            <p className="text-sm text-gray-700 dark:text-gray-300">Play Tic-Tac-Toe</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
            <div className="text-green-600 dark:text-green-400 text-lg mb-1">💰</div>
            <p className="text-sm text-gray-700 dark:text-gray-300">Win Tokens</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
            <div className="text-purple-600 dark:text-purple-400 text-lg mb-1">🏆</div>
            <p className="text-sm text-gray-700 dark:text-gray-300">Compete & Win</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl">
            <div className="text-yellow-600 dark:text-yellow-400 text-lg mb-1">⚡</div>
            <p className="text-sm text-gray-700 dark:text-gray-300">Fast Matchmaking</p>
          </div>
        </div>

        {/* Network Status Indicator */}
        {window.location.hostname !== 'localhost' && (
          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Connected to server at: {window.location.hostname}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}