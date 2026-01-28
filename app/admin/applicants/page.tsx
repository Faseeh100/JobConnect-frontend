'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Briefcase, FileText, Eye, CheckCircle, 
  Clock, XCircle, RefreshCw, Search, Calendar,
  Phone, Users, ChevronDown
} from 'lucide-react';

interface Applicant {
  id: number;
  job_id: number;
  first_name: string;
  email: string;
  phone: string;
  current_company: string | null;
  current_position: string | null;
  years_of_experience: string | null;
  skills: string[];
  cv_file_name: string | null;
  cv_file_path: string | null;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted' | 'interviewing';
  application_date: string;
  cover_letter: string | null;
}

interface Job {
  id: number;
  title: string;
  company: string;
}

interface Stats {
  total: number;
  interviewing: number;
}

export default function AdminApplicantsPage() {
  const router = useRouter();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [stats, setStats] = useState<Stats>({
    total: 0,
    interviewing: 0
  });


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

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

      // Fetch applicants
      const applicantsRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/applications`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!applicantsRes.ok) {
        const errorText = await applicantsRes.text();
        throw new Error(`Failed to fetch applicants: ${applicantsRes.status} ${applicantsRes.statusText}. ${errorText}`);
      }

      const applicantsData = await applicantsRes.json();
      if (applicantsData.success) {
        setApplicants(applicantsData.data);
        
        // Calculate stats
        const interviewingCount = applicantsData.data.filter((a: Applicant) => a.status === 'interviewing').length;
        setStats({
          total: applicantsData.data.length,
          interviewing: interviewingCount
        });
      } else {
        throw new Error(applicantsData.message || 'Failed to load applicants');
      }

      // Fetch jobs
      const jobsRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/jobs`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        if (jobsData.success) {
          setJobs(jobsData.data);
        }
      }

    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Update applicant status
  const updateStatus = async (applicantId: number, newStatus: Applicant['status']) => {
    try {
      setUpdatingStatus(applicantId);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/applications/${applicantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setApplicants(prev => prev.map(applicant => 
          applicant.id === applicantId 
            ? { ...applicant, status: newStatus }
            : applicant
        ));
        
        // Update stats
        const oldStatus = applicants.find(a => a.id === applicantId)?.status;
        setStats(prev => {
          const newStats = { ...prev };
          
          if (oldStatus === 'interviewing' && newStatus !== 'interviewing') {
            newStats.interviewing--;
          } else if (oldStatus !== 'interviewing' && newStatus === 'interviewing') {
            newStats.interviewing++;
          }
          
          return newStats;
        });
        
        // Show success message
        console.log(`Status updated to ${newStatus} for applicant ${applicantId}`);
      } else {
        throw new Error(data.message || 'Failed to update status');
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const openCVInNewTab = (applicant: Applicant) => {
    if (!applicant.cv_file_path) {
      alert('CV not available');
      return;
    }

    try {
      const storedPath = applicant.cv_file_path;
      const normalizedPath = storedPath.replace(/\\/g, '/');
      const relativePath = normalizedPath.startsWith('uploads/') 
        ? normalizedPath.substring(8) 
        : normalizedPath;
      
      // For local development - adjust if you're using a different setup
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '');
      const cvUrl = `${baseUrl}/uploads/${relativePath}`;
      
      window.open(cvUrl, '_blank', 'noopener,noreferrer');
      
    } catch (error) {
      console.error('Error opening CV:', error);
      alert('Unable to open CV. Please try again.');
    }
  };

  // Filter applicants
  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = searchTerm === '' || 
      `${applicant.first_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (applicant.phone && applicant.phone.includes(searchTerm)) ||
      (applicant.current_position && applicant.current_position.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (applicant.current_company && applicant.current_company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || applicant.status === statusFilter;
    const matchesJob = jobFilter === 'all' || applicant.job_id.toString() === jobFilter;
    
    return matchesSearch && matchesStatus && matchesJob;
  });

  // Get job title by ID
  const getJobTitle = (jobId: number) => {
    const job = jobs.find(j => j.id === jobId);
    return job ? job.title : `Job #${jobId}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Status badge color
  const getStatusColor = (status: Applicant['status']) => {
    const colors: Record<Applicant['status'], string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
      shortlisted: 'bg-purple-100 text-purple-800 border-purple-200',
      interviewing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      accepted: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[status];
  };

  // Get status icon
  const getStatusIcon = (status: Applicant['status']) => {
    const icons = {
      pending: Clock,
      reviewed: Eye,
      shortlisted: CheckCircle,
      interviewing: Calendar,
      rejected: XCircle,
      accepted: CheckCircle
    };
    return icons[status];
  };

  if (loading) {
    return (
      <div className="min-h-screen mt-16 bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Applicants Management</h1>
          <p className="text-gray-600 mt-1">
            Manage and review all job applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Applicants</p>
                <p className="text-xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="text-blue-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Interviewing</p>
                <p className="text-xl font-bold text-indigo-600">{stats.interviewing}</p>
              </div>
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Calendar className="text-indigo-600" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => fetchData()}
                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
              >
                Retry
              </button>
            </div>
            <p className="text-red-600 text-sm mt-2">
              Make sure your backend server is running on http://localhost:5000
            </p>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search applicants by name, email, phone, or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-sm min-w-35"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interviewing">Interviewing</option>
                <option value="rejected">Rejected</option>
                <option value="accepted">Accepted</option>
              </select>

              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-sm min-w-35"
              >
                <option value="all">All Jobs</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id.toString()}>
                    {job.title}
                  </option>
                ))}
              </select>

              <button
                onClick={fetchData}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 text-sm"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Scrollable Table Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap w-64">
                    <div className="flex items-center gap-1">
                      <User size={12} />
                      Applicant
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap w-48">
                    <div className="flex items-center gap-1">
                      <Briefcase size={12} />
                      Job Applied
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap w-64">
                    <div className="flex items-center gap-1">
                      <Mail size={12} />
                      Contact
                    </div>
                  </th>
                  <th className="py-3 px-7 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap w-56">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap w-24">
                    CV
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap w-40">
                    Date
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap w-48">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500 text-sm">
                      {searchTerm || statusFilter !== 'all' || jobFilter !== 'all' 
                        ? 'No applicants match your filters' 
                        : applicants.length === 0 
                          ? 'No applicants found' 
                          : 'Loading...'}
                    </td>
                  </tr>
                ) : (
                  filteredApplicants.map((applicant) => (
                    <tr key={applicant.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap w-64">
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            {applicant.first_name}
                          </p>
                          {applicant.current_position && (
                            <p className="text-xs text-gray-500">
                              {applicant.current_position}
                              {applicant.current_company && ` at ${applicant.current_company}`}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap w-48">
                        <p className="text-sm text-gray-700 font-medium">
                          {getJobTitle(applicant.job_id)}
                        </p>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap w-64">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Mail size={12} className="text-gray-400" />
                            <span className="text-sm">{applicant.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-600">{applicant.phone}</span>
                          </div>
                        </div>
                      </td>


                      <td className="py-3 px-4 whitespace-nowrap w-60">
  <div className="relative">
    <select
      value={applicant.status}
      onChange={(e) => updateStatus(applicant.id, e.target.value as Applicant['status'])}
      disabled={updatingStatus === applicant.id}
      className={`
        w-full px-5 py-2.5 rounded-lg text-sm font-medium border 
        ${getStatusColor(applicant.status)} 
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
        outline-none appearance-none pr-10
        hover:shadow-sm cursor-pointer
      `}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundPosition: 'right 0.75rem center',
        backgroundSize: '1.25em',
        backgroundRepeat: 'no-repeat',
        minHeight: '2rem'
      }}
    >
      <option value="pending">Pending</option>
      <option value="reviewed">Reviewed</option>
      <option value="shortlisted">Shortlisted</option>
      <option value="interviewing">Interviewing</option>
      <option value="rejected">Rejected</option>
      <option value="accepted">Accepted</option>
    </select>
    
    {updatingStatus === applicant.id && (
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
      </div>
    )}
  </div>
</td>


                      
                      <td className="py-3 px-4 whitespace-nowrap w-24">
                        {applicant.cv_file_name ? (
                          <button
                            onClick={() => openCVInNewTab(applicant)}
                            className="px-3 py-1.5 cursor-pointer text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors text-sm flex items-center gap-1"
                          >
                            <FileText size={16} />
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">No CV</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap w-40">
                        <span className="text-sm text-gray-600">
                          {formatDate(applicant.application_date)}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap w-48">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/admin/applicants/${applicant.id}`)}
                            className="px-3 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1.5"
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Responsive Note */}
        <div className="mt-4 text-center md:hidden">
          <p className="text-sm text-gray-500">
            ← Scroll horizontally to view all columns →
          </p>
        </div>
      </div>
    </div>
  );
}