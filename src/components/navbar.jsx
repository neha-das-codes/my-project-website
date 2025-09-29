import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, X, Menu } from 'lucide-react';
import logo from '../assets/logo.jpeg';
import { useAuth } from "../contexts/AuthContext";
import LogoutButton from "./auth/logout";

const Navbar = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleChatClick = () => {
    if (user) {
      navigate('/chat');
    } else {
      navigate('/login', { 
        state: { 
          message: "Please sign in to access chat features",
          returnPath: '/chat'
        }
      });
    }
    setIsMobileMenuOpen(false); // Close menu after navigation
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo - Reduced size and spacing */}
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img 
              src={logo} 
              alt="TeachHunt Logo" 
              className="h-20 w-auto object-contain"
            />
          </Link>
          {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-teal-600 font-semibold transition-colors duration-200 relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-teal-600 font-semibold transition-colors duration-200 relative group"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            
            {/* Auth-based Navigation */}
            {!user && (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-teal-600 font-semibold transition-colors duration-200 relative group"
                >
                  Sign In
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-200 group-hover:w-full"></span>
                </Link>
                
                {/* Chat Button */}
                <button
                  onClick={handleChatClick}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <MessageCircle size={18} />
                  <span className="hidden lg:inline">Chat</span>
                </button>
                
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Register
                </Link>
              </>
            )}
            
            {user && (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-teal-600 font-semibold transition-colors duration-200 relative group"
                >
                  Dashboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-200 group-hover:w-full"></span>
                </Link>
                
                {profile?.role === "admin" && (
                  <Link 
                    to="/admin" 
                    className="text-gray-700 hover:text-purple-600 font-semibold transition-colors duration-200 relative group"
                  >
                    Admin
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-200 group-hover:w-full"></span>
                  </Link>
                )}
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">
                        {profile?.name || user.displayName || 'User'}
                      </div>
                      {profile?.role && (
                        <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                          profile.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          profile.role === 'tutor' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {profile.role}
                        </div>
                      )}
                      {profile?.role === "tutor" && !profile?.verified && (
                        <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200 mt-1 inline-block">
                          Pending Verification
                        </div>
                      )}
                    </div>
                    <LogoutButton />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Chat Button */}
            <button
              onClick={handleChatClick}
              className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-md"
            >
              <MessageCircle size={20} />
            </button>
            
            {/* Mobile menu toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-teal-600 p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-3 space-y-3">
              <Link 
                to="/" 
                onClick={closeMobileMenu}
                className="block py-2 text-gray-700 hover:text-teal-600 font-semibold transition-colors"
              >
                Home
              </Link>
              
              <Link 
                to="/about" 
                onClick={closeMobileMenu}
                className="block py-2 text-gray-700 hover:text-teal-600 font-semibold transition-colors"
              >
                About
              </Link>

              {!user && (
                <>
                  <Link 
                    to="/login" 
                    onClick={closeMobileMenu}
                    className="block py-2 text-gray-700 hover:text-teal-600 font-semibold transition-colors"
                  >
                    Sign In
                  </Link>
                  
                  <Link 
                    to="/register" 
                    onClick={closeMobileMenu}
                    className="block py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 rounded-lg font-semibold text-center"
                  >
                    Register
                  </Link>
                </>
              )}
              
              {user && (
                <>
                  <Link 
                    to="/dashboard" 
                    onClick={closeMobileMenu}
                    className="block py-2 text-gray-700 hover:text-teal-600 font-semibold transition-colors"
                  >
                    Dashboard
                  </Link>
                  
                  {profile?.role === "admin" && (
                    <Link 
                      to="/admin" 
                      onClick={closeMobileMenu}
                      className="block py-2 text-gray-700 hover:text-purple-600 font-semibold transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  
                  <div className="py-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          {profile?.name || user.displayName || 'User'}
                        </div>
                        {profile?.role && (
                          <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                            profile.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            profile.role === 'tutor' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {profile.role}
                          </div>
                        )}
                      </div>
                      <LogoutButton />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;