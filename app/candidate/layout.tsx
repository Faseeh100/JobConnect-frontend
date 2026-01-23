'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut, User, Briefcase, FileText, Calendar, Home, Settings, Bell, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function CandidateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isCandidate, setIsCandidate] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalApplications: 0,
    interviews: 0,
    pending: 0,
    accepted: 0
  });

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auth check and fetch stats
  useEffect(() => {
    const checkAuthAndFetchStats = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!token || !storedUser) {
        router.push('/login');
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'candidate') {
        router.push('/');
        return;
      }

      setUser(parsedUser);
      setIsCandidate(true);
      
      // Fetch candidate stats
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/applications`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const userApps = result.data.filter((app: any) => 
              app.email?.toLowerCase() === parsedUser.email?.toLowerCase()
            );
            
            setStats({
              totalApplications: userApps.length,
              interviews: userApps.filter((app: any) => app.status === 'interviewing').length,
              pending: userApps.filter((app: any) => app.status === 'pending').length,
              accepted: userApps.filter((app: any) => app.status === 'accepted').length
            });
          }
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
      
      setIsLoading(false);
    };
    
    checkAuthAndFetchStats();
  }, [router]);

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/candidate/dashboard',
      icon: Home,
      active: pathname === '/candidate/dashboard',
    },
    {
      name: 'Applications',
      href: '/candidate/applications',
      icon: FileText,
      active: pathname === '/candidate/applications',
    },
    {
      name: 'Interviews',
      href: '/candidate/interviews',
      icon: Calendar,
      active: pathname === '/candidate/interviews',
    },
    {
      name: 'Profile',
      href: '/candidate/profile',
      icon: User,
      active: pathname === '/candidate/profile',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isCandidate) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Add padding-top to account for fixed header */}
      <div className="pt-16 lg:pt-0">
        {/* Mobile Sidebar Toggle */}
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

        {/* Sidebar Overlay for Mobile */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed top-16 left-0 z-30 h-[calc(100vh-4rem)]
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:top-16 lg:left-0
          w-64 bg-white border-r border-gray-200 shadow-sm
        `}>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-linear-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Candidate
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-20rem)]">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
                  ${item.active 
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className={`w-5 h-5 ${item.active ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.name}</span>
                </div>
                {item.active && <ChevronRight className="w-4 h-4 text-blue-600" />}
              </Link>
            ))}
          </nav>

          {/* Stats Section */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Applications</span>
                <span className="text-sm font-semibold text-gray-900">{stats.totalApplications}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Interviews</span>
                <span className="text-sm font-semibold text-gray-900">{stats.interviews}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="text-sm font-semibold text-yellow-600">{stats.pending}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`
          min-h-[calc(100vh-4rem)] transition-all duration-300
          ${sidebarOpen ? 'lg:ml-64' : ''}
        `}>

          {/* Page Content */}
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}