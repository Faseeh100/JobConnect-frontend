'use client';

import { useEffect, useState } from 'react';
import { Briefcase, Calendar, CheckCircle, Clock, TrendingUp, Users, Award, FileText, ArrowRight, Zap, 
  XCircle, Eye } from 'lucide-react';
import Link from 'next/link';

interface Application {
  id: number;
  job_id: number;
  job_title: string;
  company: string;
  status: string;
  application_date: string;
  skills: string[];
  years_of_experience?: string;
}

interface Stats {
  total: number;
  pending: number;
  reviewed: number;
  interviewing: number;
  accepted: number;
  rejected: number;
}

export default function CandidateDashboard() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    reviewed: 0,
    interviewing: 0,
    accepted: 0,
    rejected: 0
  });
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!token || !storedUser) {
        window.location.href = '/login';
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/applications`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Filter applications for this candidate
            const userApplications = result.data.filter((app: any) => 
              app.email?.toLowerCase() === parsedUser.email?.toLowerCase()
            );
            
            // Calculate stats
            const statsData: Stats = {
              total: userApplications.length,
              pending: userApplications.filter((app: any) => app.status === 'pending').length,
              reviewed: userApplications.filter((app: any) => app.status === 'reviewed').length,
              interviewing: userApplications.filter((app: any) => app.status === 'interviewing').length,
              accepted: userApplications.filter((app: any) => app.status === 'accepted').length,
              rejected: userApplications.filter((app: any) => app.status === 'rejected').length
            };
            
            setStats(statsData);
            
            // Get recent applications (last 5)
            const recent = userApplications
              .slice(0, 5)
              .map((app: any) => ({
                id: app.id,
                job_id: app.job_id,
                job_title: app.job?.title || 'Position',
                company: app.job?.company || 'Company',
                status: app.status,
                application_date: new Date(app.application_date || app.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }),
                skills: Array.isArray(app.skills) ? app.skills : [],
                years_of_experience: app.years_of_experience
              }));
            
            setRecentApps(recent);
          }
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'interviewing': return 'bg-purple-100 text-purple-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'reviewed': return <FileText className="w-4 h-4" />;
      case 'interviewing': return <Calendar className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
            <p className="text-blue-100 opacity-90">Track your job applications and interview progress in one place</p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5" />
                <span>{stats.total} Applications</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>{stats.interviewing} Interviews</span>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Link 
              href="/postings"
              className="inline-flex items-center px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Zap className="w-4 h-4 mr-2" />
              Find New Jobs
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Applications</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{stats.pending} pending</span> review
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Interviews</p>
              <p className="text-3xl font-bold mt-2">{stats.interviewing}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              {stats.interviewing > 0 ? 'Next interview scheduled' : 'No interviews yet'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Success Rate</p>
              <p className="text-3xl font-bold mt-2">
                {stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0}%
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              {stats.accepted} accepted • {stats.rejected} rejected
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Response Rate</p>
              <p className="text-3xl font-bold mt-2">
                {stats.total > 0 ? Math.round(((stats.total - stats.pending) / stats.total) * 100) : 0}%
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              {stats.total - stats.pending} of {stats.total} applications reviewed
            </p>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
          <Link 
            href="/candidate/applications" 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
          >
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Applied
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentApps.length > 0 ? (
                recentApps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {app.job_title}
                      </div>
                      {app.skills.length > 0 && (
                        <div className="mt-1">
                          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mr-1">
                            {app.skills[0]}
                          </span>
                          {app.skills.length > 1 && (
                            <span className="text-xs text-gray-400">
                              +{app.skills.length - 1} more
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{app.company}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                        <span className="mr-1">{getStatusIcon(app.status)}</span>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {app.application_date}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="font-medium">No applications yet</p>
                      <p className="text-sm mt-1">Start applying to jobs to see them here</p>
                      <Link 
                        href="/postings" 
                        className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800"
                      >
                        Browse Jobs <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}