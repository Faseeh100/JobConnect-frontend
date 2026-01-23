'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Menu, X, MoreVertical, LogOut, User } from 'lucide-react';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin') {
      router.push('/postings');
      return;
    }

    setUser(parsedUser);
    setIsAdmin(true);
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Mobile Sidebar Toggle Button - Fixed position */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-3 rounded-xl bg-linear-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-md border border-gray-700 hover:border-blue-500/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          >
            {sidebarOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      )}

      {/* Mobile user menu button - Fixed at top right */}
      {isMobile && user && (
        <div className="fixed top-3.5 right-1 z-50">
          <div className="relative">

            {/* Mobile dropdown menu */}
            {mobileMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setMobileMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl shadow-black/50 py-2 z-50 animate-fade-in-up">
                  <div className="px-4 py-3 border-b border-gray-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{user?.name}</p>
                        <p className="text-sm text-gray-400">{user?.email || 'user@example.com'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-800 pt-2">
                    <button
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                      }}
                      className="flex items-center justify-center w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors rounded-lg mx-2"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sidebar - Always positioned under header */}
      {!isMobile && sidebarOpen && (
        <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] z-40">
          <Sidebar />
        </div>
      )}

      {/* Mobile Sidebar */}
      {isMobile && sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className={`
            fixed top-19 left-0 h-[calc(100vh-4rem)] z-50 
            transform transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className={`
        min-h-screen
        transition-all duration-300
        ${!isMobile && sidebarOpen ? 'md:ml-64' : ''}
      `}>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}