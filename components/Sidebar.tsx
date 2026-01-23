'use client';

import { Users, Briefcase, Home, Settings, FileText, UserPlus, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

export default function Sidebar({ className = '', onClose }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      name: 'Dashboard',
      icon: <Home size={20} />,
      path: '/admin',
      active: pathname === '/admin'
    },
    {
      name: 'Applicants',
      icon: <Users size={20} />,
      path: '/admin/applicants',
      active: pathname.startsWith('/admin/applicants')
    },
    {
      name: 'Job Postings',
      icon: <Briefcase size={20} />,
      path: '/admin/jobs',
      active: pathname === '/admin/jobs'
    },
    {
      name: 'Add New Job',
      icon: <UserPlus size={20} />,
      path: '/admin/jobs/new',
      active: pathname === '/admin/jobs/new'
    },
    {
      name: 'Settings',
      icon: <Settings size={20} />,
      path: '/admin/settings',
      active: pathname === '/admin/settings'
    },
  ];

  const handleLinkClick = () => {
    if (onClose && window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <aside className={`w-64 bg-gray-900 text-white h-screen md:h-[calc(100vh-4rem)] flex flex-col ${className}`}>
      {/* Mobile Header with Close Button */}
      <div className="md:hidden p-6 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Admin Panel</h2>
          <p className="text-gray-400 text-sm mt-1">Manage your platform</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-gray-800"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block p-6 border-b border-gray-800">
        <h2 className="text-lg font-bold">Admin Panel</h2>
        <p className="text-gray-400 text-sm mt-1">Manage your platform</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.path}
                onClick={handleLinkClick}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  item.active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className={item.active ? 'text-white' : 'text-gray-400'}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};