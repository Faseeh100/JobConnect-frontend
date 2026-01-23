'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, Download, Eye, Calendar, CheckCircle, Clock, XCircle, FileText, 
  ChevronDown, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Application {
  id: number;
  job_id: number;
  job_title: string;
  company: string;
  status: string;
  application_date: string;
  cover_letter?: string;
  skills: string[];
  years_of_experience?: string;
  job?: {
    id: number;
    title: string;
    company: string;
    location: string;
    type: string;
    experience_level: string;
  };
}

export default function CandidateApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!token || !storedUser) {
        window.location.href = '/login';
        return;
      }

      const user = JSON.parse(storedUser);
      
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
            const userApps = result.data
              .filter((app: any) => app.email?.toLowerCase() === user.email?.toLowerCase())
              .map((app: any) => ({
                id: app.id,
                job_id: app.job_id,
                job_title: app.job?.title || 'Unknown Position',
                company: app.job?.company || 'Unknown Company',
                status: app.status,
                application_date: new Date(app.application_date || app.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }),
                cover_letter: app.cover_letter,
                skills: Array.isArray(app.skills) ? app.skills : [],
                years_of_experience: app.years_of_experience,
                job: app.job
              }));
            
            // Sort by newest first
            const sortedApps = userApps.sort((a: Application, b: Application) => 
              new Date(b.application_date).getTime() - new Date(a.application_date).getTime()
            );
            
            setApplications(sortedApps);
            setFilteredApps(sortedApps);
          }
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
      
      setIsLoading(false);
    };
    
    fetchApplications();
  }, []);

  useEffect(() => {
    let filtered = [...applications];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    // Apply sorting
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.application_date).getTime() - new Date(a.application_date).getTime());
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.application_date).getTime() - new Date(b.application_date).getTime());
    } else if (sortBy === 'company') {
      filtered.sort((a, b) => a.company.localeCompare(b.company));
    }
    
    setFilteredApps(filtered);
  }, [searchTerm, statusFilter, sortBy, applications]);

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'reviewed':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'interviewing':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'accepted':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3 mr-1" />;
      case 'reviewed': return <FileText className="w-3 h-3 mr-1" />;
      case 'interviewing': return <Calendar className="w-3 h-3 mr-1" />;
      case 'accepted': return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'rejected': return <XCircle className="w-3 h-3 mr-1" />;
      default: return <Clock className="w-3 h-3 mr-1" />;
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600">Track all your job applications in one place</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by job title, company, or skills..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="interviewing">Interviewing</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="company">Company A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Applied
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApps.length > 0 ? (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {app.job_title}
                        </div>
                        <div className="text-sm text-gray-500">{app.company}</div>
                        {app.job && (
                          <div className="text-xs text-gray-400 mt-1">
                            {app.job.location} • {app.job.type} • {app.job.experience_level}
                          </div>
                        )}
                        <div className="mt-2">
                          {app.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mr-1 mb-1"
                            >
                              {skill}
                            </span>
                          ))}
                          {app.skills.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{app.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusBadge(app.status)}>
                        {getStatusIcon(app.status)}
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {app.application_date}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {app.years_of_experience || 'Not specified'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      {applications.length === 0 ? (
                        <>
                          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p className="font-medium">No applications found</p>
                          <p className="text-sm mt-1">Start applying to jobs to see them here</p>
                          <Link 
                            href="/postings" 
                            className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800"
                          >
                            Browse Jobs <ArrowRight className="w-4 h-4 ml-1" />
                          </Link>
                        </>
                      ) : (
                        <>
                          <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p className="font-medium">No matching applications</p>
                          <p className="text-sm mt-1">Try adjusting your search or filter</p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Summary */}
        {filteredApps.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {filteredApps.length} of {applications.length} applications
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{applications.filter(a => a.status === 'interviewing').length}</span> interviews scheduled
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{applications.filter(a => a.status === 'accepted').length}</span> offers received
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}