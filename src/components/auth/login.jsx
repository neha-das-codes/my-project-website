import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { auth, googleProvider } from "../../firebase/firebaseConfig";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, User, Lock, Mail } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get any message from navigation state
  const loginMessage = location.state?.message;

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // Check if there's a return path from search or chat
      const returnPath = location.state?.returnPath || "/dashboard";
      const searchData = location.state?.searchData;
      
      if (searchData && (searchData.subject || searchData.location)) {
        const params = new URLSearchParams();
        if (searchData.subject) params.set('subject', searchData.subject);
        if (searchData.location) params.set('location', searchData.location);
        navigate(`${returnPath}${params.toString() ? '?' + params.toString() : ''}`);
      } else {
        navigate(returnPath);
      }
    } catch (err) {
      console.error("Login error details:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      
      // Handle specific authentication errors
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email. Please sign up first.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Incorrect password. Please try again.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (err.code === 'auth/user-disabled') {
        setError("This account has been disabled. Please contact support.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError("Sign in failed. This email might be registered with Google sign-in only.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Clear any previous error states
      setError("");
      
      // Configure the provider with additional settings
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, googleProvider);
      
      if (result.user) {
        const returnPath = location.state?.returnPath || "/dashboard";
        const searchData = location.state?.searchData;
        
        if (searchData && (searchData.subject || searchData.location)) {
          const params = new URLSearchParams();
          if (searchData.subject) params.set('subject', searchData.subject);
          if (searchData.location) params.set('location', searchData.location);
          navigate(`${returnPath}${params.toString() ? '?' + params.toString() : ''}`);
        } else {
          navigate(returnPath);
        }
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      
      // Handle specific error codes with more user-friendly messages
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Google sign-in was cancelled. Please try again.");
      } else if (err.code === 'auth/popup-blocked') {
        setError("Popup was blocked by your browser. Please allow popups and try again.");
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Don't show error for this case as it's usually due to rapid clicking
        return;
      } else if (err.code === 'auth/unauthorized-domain') {
        setError("This domain is not authorized for Google sign-in. Please contact support.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Google sign-in is not enabled. Please contact support.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Google sign-in failed. Please try again or use email login.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Please check your inbox.");
      setError("");
    } catch (err) {
      setError("Failed to send reset email. Please check your email address.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with Illustration */}
          <div className="relative bg-gradient-to-br from-teal-500 to-cyan-500 px-8 py-12 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-teal-100">Please sign in to continue</p>
            
            {/* Show login message if redirected */}
            {loginMessage && (
              <div className="mt-4 p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-30">
                <p className="text-white text-sm">{loginMessage}</p>
              </div>
            )}
          </div>

          {/* Form Content */}
          <div className="px-8 py-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {message && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm text-center">{message}</p>
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-6">
              {/* Email Input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all outline-none text-gray-700 placeholder-gray-400"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all outline-none text-gray-700 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:from-teal-700 hover:to-cyan-700 focus:ring-4 focus:ring-teal-200 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500 bg-white">Or continue with</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center py-4 px-4 border border-gray-300 rounded-2xl shadow-sm bg-white text-gray-700 font-medium hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition-all transform hover:scale-[1.02] disabled:opacity-50"
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google"
                className="w-5 h-5 mr-3"
              />
              Sign in with Google
            </button>

            {/* Sign Up Link */}
            <p className="text-center mt-8 text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => navigate('/register')}
                className="text-teal-600 hover:text-teal-700 font-semibold"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            By signing in, you agree to our{" "}
            <a href="/terms" className="text-teal-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-teal-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;