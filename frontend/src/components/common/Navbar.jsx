import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUser, FaSignOutAlt, FaTrophy, FaPlus } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-playto-blue to-playto-purple rounded-lg"></div>
            <span className="text-xl font-bold text-gray-800">Playto Feed</span>
          </Link>

          {/* Navigation items */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium">
                  Feed
                </Link>
                
                {/* Create Post Button */}
                <button
                  onClick={() => document.getElementById('create-post-modal')?.showModal()}
                  className="btn-primary flex items-center space-x-2"
                >
                  <FaPlus />
                  <span>New Post</span>
                </button>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-playto-blue to-playto-purple rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left hidden md:block">
                      <div className="font-medium text-gray-800">{user?.username}</div>
                      <div className="text-sm text-gray-500">
                        {user?.profile?.total_karma || 0} karma
                      </div>
                    </div>
                  </button>

                  {/* Dropdown menu */}
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20 border">
                        <div className="px-4 py-2 border-b">
                          <div className="font-medium text-gray-800">{user?.username}</div>
                          <div className="text-sm text-gray-500">
                            {user?.profile?.total_karma || 0} karma
                          </div>
                        </div>
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaUser className="mr-3" />
                          Profile
                        </Link>
                        <Link
                          to="/leaderboard"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaTrophy className="mr-3" />
                          Leaderboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50"
                        >
                          <FaSignOutAlt className="mr-3" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;