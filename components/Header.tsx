'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, LogOut, Briefcase, Search, Bell, ChevronDown, Sparkles } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

export default function Header({ className = '' }: HeaderProps) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Function to update user from localStorage
  const updateUserFromStorage = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Initial check
    updateUserFromStorage();

    // Listen for storage changes (other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        updateUserFromStorage();
      }
    };

    // Listen for custom auth events (same tab)
    const handleAuthChange = () => {
      updateUserFromStorage();
    };

    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowUserMenu(false);
    
    // Dispatch custom event for other components
    window.dispatchEvent(new Event('authChange'));
    
    window.location.href = '/';
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all py-3 duration-300 ${isScrolled ? 'backdrop-blur-lg bg-gray-900/90 shadow-2xl shadow-black/20' : 'bg-linear-to-r from-gray-900 via-gray-800 to-gray-900'} ${className}`}>
      {/* Animated border bottom */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent"></div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float-slow"
            style={{
              left: `${20 + i * 30}%`,
              top: '50%',
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-cyan-400 rounded-xl blur group-hover:blur-md transition-all duration-300 opacity-70"></div>
              <div className="relative p-2 bg-linear-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700">
                <Briefcase className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent animate-gradient">
                JobConnect
              </h1>
              <p className="text-xs text-gray-400 font-medium">Find your dream job</p>
            </div>
          </Link>

          {/* User Section */}
          <div className="flex items-center space-x-3">

            {/* User Actions */}
            {isLoading ? (
              // Loading skeleton
              <div className="flex items-center space-x-3">
                <div className="w-28 h-10 bg-linear-to-r from-gray-800 to-gray-700 rounded-xl animate-pulse"></div>
              </div>
            ) : user ? (
              // User is logged in
              <div className="relative">
                {/* BOTH Admin and Candidate have dropdowns now */}
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 cursor-pointer p-2 pl-4 pr-4 rounded-xl bg-linear-to-r from-gray-800 to-gray-900 border border-gray-700 hover:border-blue-500/50 hover:from-gray-800 hover:to-gray-800 transition-all duration-300 group"
                >
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-linear-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-semibold text-white">{user.name || 'User'}</span>
                    <span className="text-xs text-gray-400">
                      {user.role === 'admin' ? 'Admin Panel' : 'My Profile'}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu - Shows for BOTH admin and candidate */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl shadow-black/50 py-2 z-50 animate-fade-in-up">
                      <div className="px-4 py-3 border-b border-gray-800">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{user.name}</p>
                            <p className="text-sm text-gray-400">{user.email || 'user@example.com'}</p>
                            <p className="text-xs text-blue-400 font-medium mt-1 capitalize">
                              {user.role === 'admin' ? 'Admin Account' : 'Candidate Account'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Dashboard Link - Different for admin vs candidate */}
                      <div className="border-b border-gray-800 py-2">
                        <Link
                          href={user.role === 'admin' ? '/admin' : '/candidate/dashboard'}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors rounded-lg mx-2 group"
                        >
                          <div className="p-2 mr-2 bg-gray-800 group-hover:bg-blue-500/20 rounded-lg transition-colors">
                            <Briefcase className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.role === 'admin' ? 'Admin Dashboard' : 'My Profile'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {user.role === 'admin'
                                ? 'Manage jobs and applications'
                                : 'View applications & interviews'
                              }
                            </p>
                          </div>
                        </Link>
                      </div>
                      
                      <div className="border-t border-gray-800 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center justify-center cursor-pointer w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors rounded-lg mx-2 group"
                        >
                          <div className="p-1.5 mr-2 bg-red-500/10 group-hover:bg-red-500/20 rounded-lg transition-colors">
                            <LogOut className="w-4 h-4" />
                          </div>
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // User is not logged in
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-5 py-2.5 cursor-pointer rounded-xl bg-linear-to-r from-gray-800 to-gray-900 border border-gray-700 text-gray-300 hover:text-white hover:border-blue-500/50 hover:from-gray-800 hover:to-gray-800 transition-all duration-300 font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-500 hover:to-cyan-400 transition-all duration-300 font-medium group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative">Get Started</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}