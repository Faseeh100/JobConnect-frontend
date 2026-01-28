'use client';

import { Briefcase, MapPin, DollarSign, Clock, CheckCircle, Code, Loader2, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  requirements: string[];
  skills: string[];
  experience_level: string;
  is_active: boolean;
}

interface ApplicationStatus {
  hasApplied: boolean;
  application?: {
    status: string;
    id: number;
    application_date: string;
  };
  canReapply: boolean;
  success: boolean;
}

export default function PostingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingJobs, setFetchingJobs] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [error, setError] = useState<string>('');
  const [applicationStatuses, setApplicationStatuses] = useState<Record<number, ApplicationStatus>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingJobSwitch, setLoadingJobSwitch] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobile && sidebarOpen && 
          !target.closest('.job-sidebar') && 
          !target.closest('.sidebar-toggle')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  // Fetch jobs from backend API
  const fetchJobs = async () => {
    try {
      setFetchingJobs(true);
      setError('');
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setJobs(data.data);
        // Select first job by default
        if (data.data.length > 0) {
          setSelectedJob(data.data[0]);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch jobs');
      }
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Failed to load jobs. Please try again later.');
      setJobs([]);
    } finally {
      setFetchingJobs(false);
    }
  };

  // Check application status for a specific job
  const checkApplicationStatus = async (jobId: number) => {
    try {
      const userEmail = user?.email;
      if (!userEmail) return;

      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/jobs/${jobId}/application-status?email=${encodeURIComponent(userEmail)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setApplicationStatuses(prev => ({
          ...prev,
          [jobId]: data
        }));
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  // Call checkApplicationStatus when jobs are fetched and user is logged in
  useEffect(() => {
    if (user && jobs.length > 0) {
      jobs.forEach(job => {
        checkApplicationStatus(job.id);
      });
    }
  }, [user, jobs]);

  useEffect(() => {
    // Check if user is logged in (but don't redirect to login)
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // If user is admin, redirect to admin panel
      if (parsedUser.role === 'admin') {
        router.push('/admin');
        return;
      }
    } else {
      // User is not logged in - that's OK, just set user to null
      setUser(null);
    }
    
    setLoading(false);
    fetchJobs();
  }, [router]);


  const handleJobSelect = (job: Job) => {
    // Don't load if clicking the same job
    if (selectedJob?.id === job.id) return;
    setLoadingJobSwitch(true);
  
    if (isMobile) {
      setSidebarOpen(false);
    }
  
    setSelectedJob(job);
  
    setTimeout(() => {
      setLoadingJobSwitch(false);
    }, 1000);
  };

  // Handle apply button click - redirect to login if not logged in
  const handleApplyClick = () => {
    if (!selectedJob) return;
    
    // Check if user is logged in
    if (!user) {
      // Save the job ID in sessionStorage to remember after login
      sessionStorage.setItem('redirectJobId', selectedJob.id.toString());
      // Redirect to login
      router.push('/login');
      return;
    }
    
    // If user is logged in, check application status
    const status = applicationStatuses[selectedJob.id];
    
    if (status?.hasApplied && status.application?.status !== 'rejected') {
      alert(`You have already applied for this job. Current status: ${status.application?.status || 'pending'}. You can only re-apply if your application was rejected.`);
      return;
    }
    
    router.push(`/apply?jobId=${selectedJob.id}`);
  };

  // Get apply button text based on login and application status
  const getApplyButtonText = (jobId: number) => {
    if (!user) {
      return 'Apply Now';
    }
    
    const status = applicationStatuses[jobId];
    
    if (!status || !status.hasApplied) {
      return 'Apply Now';
    }
    
    const appStatus = status.application?.status || 'pending';
    
    switch(appStatus) {
      case 'pending': return 'Application Submitted';
      case 'reviewed': return 'Under Review';
      case 'shortlisted': return 'Shortlisted';
      case 'interviewing': return 'Interviewing';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Re-apply (Previously Rejected)';
      default: return 'Applied';
    }
  };

  // Check if apply button should be disabled
  const isApplyDisabled = (jobId: number) => {
    // If user is not logged in, button is NOT disabled (will redirect to login)
    if (!user) return false;
    
    const status = applicationStatuses[jobId];
    return status?.hasApplied && status.application?.status !== 'rejected';
  };

  // Handle save for later
  const handleSaveForLater = async () => {
    if (!selectedJob) return;
    
    if (!user) {
      alert('Please login to save jobs for later.');
      router.push('/login');
      return;
    }
    
    try {
      alert(`Job "${selectedJob.title}" saved for later!`);
      
      const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      if (!savedJobs.find((job: any) => job.id === selectedJob.id)) {
        savedJobs.push(selectedJob);
        localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
      }
    } catch (err) {
      console.error('Error saving job:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-16 bg-gray-100 max-w-7xl">
      {/* Mobile Sidebar Toggle Button */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-50 sidebar-toggle">
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Fixed Left Panel - Job List */}
        <div className={`
          fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white border-r border-gray-200 shadow-sm 
          flex flex-col z-40 job-sidebar transition-transform duration-300
          ${isMobile 
            ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') 
            : 'translate-x-0'
          }
          lg:translate-x-0
        `}>
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-800">Job Listings</h1>
                <p className="text-gray-500 text-sm mt-1">
                  {fetchingJobs ? 'Loading...' : `${jobs.length} positions available`}
                </p>
              </div>
              <button 
                onClick={fetchJobs}
                disabled={fetchingJobs}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
              >
                {fetchingJobs ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'Refresh'
                )}
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {user ? (
                <>Welcome, <span className="font-semibold text-blue-600">{user.name}</span></>
              ) : (
                <>Welcome! <span className="text-gray-500">Sign in to apply for jobs</span></>
              )}
            </div>
            
            {error && (
              <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded border border-red-200">
                {error}
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {fetchingJobs ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 size={24} className="animate-spin text-blue-600" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-8 text-center">
                <Briefcase size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No job listings available</p>
                {error && (
                  <p className="text-sm text-red-500 mt-2">{error}</p>
                )}
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                      selectedJob?.id === job.id 
                        ? 'border-blue-500 bg-blue-50 shadow-sm' 
                        : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleJobSelect(job)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-sm">{job.title}</h3>
                        <p className="text-blue-600 font-medium text-xs mt-1">{job.company}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {job.type}
                      </span>
                    </div>
                    
                    <div className="mt-3 flex items-center text-gray-600 text-xs">
                      <MapPin size={12} className="mr-1" />
                      {job.location}
                    </div>
                    
                    <div className="mt-2 flex items-center text-gray-600 text-xs">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                        {job.experience_level}
                      </span>
                      <span className="ml-2 text-blue-600 font-medium">{job.salary}</span>
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-1">
                      {job.skills.slice(0, 2).map((skill, index) => (
                        <span 
                          key={index} 
                          className="bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 2 && (
                        <span className="text-gray-500 text-xs">+{job.skills.length - 2}</span>
                      )}
                    </div>
                    
                    {/* Show application status badge only if user is logged in */}
                    {user && applicationStatuses[job.id]?.hasApplied && (
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                          applicationStatuses[job.id].application?.status === 'rejected' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {applicationStatuses[job.id].application?.status?.toUpperCase() || 'APPLIED'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Content Area - Scrolls independently */}
        <div className={`
          flex-1 transition-all duration-300
          ${isMobile ? 'ml-0' : 'lg:ml-80'}
          ${sidebarOpen && isMobile ? 'lg:ml-80' : 'ml-0'}
        `}>
          {/* Mobile Header for Job Title */}
          {isMobile && selectedJob && (
            <div className="lg:hidden bg-white border-b border-gray-200 p-4 sticky top-16 z-30">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold text-gray-800 truncate">{selectedJob.title}</h1>
                  <p className="text-blue-600 text-sm truncate">{selectedJob.company}</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 md:p-8">
            {selectedJob ? (
              <div>
                {/* Job Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase size={24} className="text-blue-500" />
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{selectedJob.title}</h1>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2">
                    <span className="text-lg md:text-xl text-blue-600 font-medium">{selectedJob.company}</span>
                    <span className="hidden md:inline text-gray-400">•</span>
                    <span className="text-gray-600">{selectedJob.location}</span>
                    <span className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-md md:ml-auto mt-2 md:mt-0">
                      {selectedJob.salary}
                    </span>
                  </div>
                </div>

                {loadingJobSwitch && (
                  <div className="flex flex-col items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading job details...</p>
                    <p className="text-gray-500 text-sm mt-1">Please wait a moment</p>
                  </div>
                )}

                {/* Job Meta Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 pb-6 border-b border-gray-200">
                  <div className="flex items-center bg-gray-50 px-4 py-3 rounded-lg">
                    <Clock size={18} className="text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Job Type</p>
                      <p className="font-medium">{selectedJob.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center bg-gray-50 px-4 py-3 rounded-lg">
                    <MapPin size={18} className="text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{selectedJob.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center bg-gray-50 px-4 py-3 rounded-lg">
                    <DollarSign size={18} className="text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Experience Level</p>
                      <p className="font-medium">{selectedJob.experience_level}</p>
                    </div>
                  </div>
                </div>

                {/* Loading Spinner for Job Switching */}
                {/* {loadingJobSwitch && (
                  <div className="flex flex-col items-center justify-center h-80">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading job details...</p>
                    <p className="text-gray-500 text-sm mt-1">Please wait a moment</p>
                  </div>
                )} */}

                {/* Job Description */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Job Description</h2>
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
                  </div>
                </div>

                {/* Required Skills */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Code size={20} className="mr-2 text-blue-500" />
                    Required Skills
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {selectedJob.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Requirements</h2>
                  <div className="space-y-3">
                    {selectedJob.requirements.map((req, index) => (
                      <div key={index} className="flex items-start bg-gray-50 p-4 rounded-lg">
                        <CheckCircle size={18} className="text-green-500 mr-3 mt-0.5 shrink-0" />
                        <span className="text-gray-700">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Show application status warning if already applied */}
                {user && applicationStatuses[selectedJob.id]?.hasApplied && 
                 applicationStatuses[selectedJob.id].application?.status !== 'rejected' && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-700">
                      You have already applied for this job. Current status: <strong>{applicationStatuses[selectedJob.id].application?.status?.toUpperCase() || 'PENDING'}</strong>
                    </p>
                    <p className="text-yellow-600 text-sm mt-1">
                      You can only re-apply if your application was rejected.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleApplyClick}
                    disabled={isApplyDisabled(selectedJob.id)}
                    className={`flex-1 cursor-pointer ${
                      isApplyDisabled(selectedJob.id)
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white font-medium py-3 px-6 rounded-lg transition-colors text-sm`}
                  >
                    {getApplyButtonText(selectedJob.id)}
                  </button>
                  <button 
                    onClick={handleSaveForLater}
                    className="flex-1 cursor-pointer border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 px-6 rounded-lg transition-colors text-sm"
                  >
                    Save for Later
                  </button>
                </div>
              </div>
            ) : jobs.length > 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 md:p-12">
                <div className="text-center">
                  <Briefcase size={64} className="mx-auto text-gray-300 mb-4" />
                  <h2 className="text-2xl font-medium text-gray-600">Select a job to view details</h2>
                  <p className="text-gray-500 mt-2">Choose a position from the list on the left</p>
                  {isMobile && (
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="mt-4 cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg 
                      hover:bg-blue-700 transition-colors inline-flex items-center sidebar-toggle"
                    >
                      <Menu className="w-4 h-4 mr-2" />
                      Show Job List
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-8 md:p-12">
                <div className="text-center">
                  <Briefcase size={64} className="mx-auto text-gray-300 mb-4" />
                  <h2 className="text-2xl font-medium text-gray-600">No jobs available</h2>
                  <p className="text-gray-500 mt-2">Check back later for new opportunities</p>
                  <button 
                    onClick={fetchJobs}
                    className="mt-4 cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg 
                    hover:bg-blue-700 transition-colors"
                  >
                    Refresh Jobs
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}