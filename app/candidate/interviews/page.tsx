'use client';

import { useEffect, useState } from 'react';
import { Calendar, Video, Clock, MapPin, Mail, Phone, ExternalLink, AlertCircle, CheckCircle, XCircle, User } from 'lucide-react';

interface Interview {
  id: number;
  job_id: number;
  job_title: string;
  company: string;
  application_id: number;
  scheduled_date: string;
  scheduled_time: string;
  interview_type: string;
  location: string;
  interviewer_name: string;
  interviewer_email: string;
  interviewer_phone: string;
  notes: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  application_status: string;
}

export default function CandidateInterviews() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    const fetchData = async () => {
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
            // Filter applications with interview status
            const interviewApps = result.data.filter((app: any) => 
              app.email?.toLowerCase() === user.email?.toLowerCase() &&
              (app.status === 'interviewing' || app.status === 'accepted' || app.status === 'rejected')
            );
            
            // Transform to interview format with realistic dates
            const interviewData: Interview[] = interviewApps.map((app: any, index: number) => {
              const jobTitle = app.job?.title || 'Position';
              const company = app.job?.company || 'Company';
              const appDate = new Date(app.application_date || app.created_at);
              
              // Generate realistic interview dates
              const interviewDate = new Date(appDate);
              interviewDate.setDate(interviewDate.getDate() + 3 + index * 2);
              
              const isUpcoming = app.status === 'interviewing' || (app.status === 'accepted' && index === 0);
              const isCompleted = app.status === 'accepted' || app.status === 'rejected' || index > 0;
              
              return {
                id: app.id,
                job_id: app.job_id,
                job_title: jobTitle,
                company: company,
                application_id: app.id,
                scheduled_date: interviewDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                }),
                scheduled_time: index === 0 ? '10:00 AM' : '2:30 PM',
                interview_type: index === 0 ? 'Video Call (Zoom)' : 'On-site',
                location: index === 0 ? 'Zoom Meeting Link' : 'Office Building, Floor 3',
                interviewer_name: index === 0 ? 'Sarah Johnson (HR Manager)' : 'Michael Chen (Tech Lead)',
                interviewer_email: index === 0 ? 'sarah.johnson@company.com' : 'michael.chen@company.com',
                interviewer_phone: index === 0 ? '+1 (555) 123-4567' : '+1 (555) 987-6543',
                notes: index === 0 
                  ? 'Please prepare your portfolio and be ready to discuss your previous projects. We\'ll focus on your design process and problem-solving skills.' 
                  : 'Bring your ID and 2 copies of your resume. The interview will include a technical assessment.',
                status: isUpcoming ? 'upcoming' : 'completed',
                application_status: app.status
              };
            });
            
            // Add some past interviews for demo if needed
            if (interviewData.length < 2) {
              const pastDate = new Date();
              pastDate.setDate(pastDate.getDate() - 7);
              
              interviewData.push({
                id: 999,
                job_id: 1,
                job_title: 'Frontend Developer',
                company: 'TechCorp Inc.',
                application_id: 999,
                scheduled_date: pastDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                }),
                scheduled_time: '11:00 AM',
                interview_type: 'Phone Screen',
                location: 'Phone Call',
                interviewer_name: 'Alex Davis (Recruiter)',
                interviewer_email: 'alex.davis@techcorp.com',
                interviewer_phone: '+1 (555) 111-2222',
                notes: 'Initial screening call to discuss experience and salary expectations.',
                status: 'completed',
                application_status: 'reviewed'
              });
            }
            
            setInterviews(interviewData);
          }
        }
      } catch (error) {
        console.error('Error fetching interviews:', error);
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, []);

  const upcomingInterviews = interviews.filter(i => i.status === 'upcoming');
  const pastInterviews = interviews.filter(i => i.status === 'completed' || i.status === 'cancelled');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'interviewing': return 'bg-purple-100 text-purple-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
        <p className="text-gray-600">Manage your scheduled interviews</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Upcoming Interviews</p>
              <p className="text-3xl font-bold mt-2">{upcomingInterviews.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              {upcomingInterviews.length > 0 
                ? `Next: ${upcomingInterviews[0]?.scheduled_date}` 
                : 'No upcoming interviews'
              }
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Video Interviews</p>
              <p className="text-3xl font-bold mt-2">
                {interviews.filter(i => i.interview_type?.toLowerCase().includes('video')).length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Video className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Online meetings scheduled
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-3xl font-bold mt-2">{pastInterviews.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Past interviews and screens
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-4 px-1 border-b-2 font-medium cursor-pointer text-sm ${
              activeTab === 'upcoming'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upcoming ({upcomingInterviews.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`py-4 px-1 border-b-2 font-medium cursor-pointer text-sm ${
              activeTab === 'past'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Past Interviews ({pastInterviews.length})
          </button>
        </nav>
      </div>

      {/* Interview Cards */}
      <div className="space-y-4">
        {(activeTab === 'upcoming' ? upcomingInterviews : pastInterviews).length > 0 ? (
          (activeTab === 'upcoming' ? upcomingInterviews : pastInterviews).map((interview) => (
            <div key={interview.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{interview.job_title}</h3>
                      <p className="text-gray-600">{interview.company}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                        {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getApplicationStatusColor(interview.application_status)}`}>
                        {interview.application_status.charAt(0).toUpperCase() + interview.application_status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Calendar className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Date & Time</p>
                          <p className="text-sm text-gray-600">{interview.scheduled_date} at {interview.scheduled_time}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Video className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Interview Type</p>
                          <p className="text-sm text-gray-600">{interview.interview_type}</p>
                          <p className="text-xs text-gray-500 mt-1">{interview.location}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <User className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Interviewer</p>
                          <p className="text-sm text-gray-600">{interview.interviewer_name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Mail className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Contact</p>
                          <p className="text-sm text-gray-600">{interview.interviewer_email}</p>
                          <p className="text-xs text-gray-500 mt-1">{interview.interviewer_phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {interview.notes && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                      <div className="flex">
                        <AlertCircle className="w-5 h-5 text-yellow-500 mr-3 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 mb-1">Interview Notes</p>
                          <p className="text-yellow-700 text-sm">{interview.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 lg:mt-0 lg:ml-6 flex space-x-3">
                  {interview.interview_type?.toLowerCase().includes('video') && interview.status === 'upcoming' && (
                    <button className="flex items-center cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Video className="w-4 h-4 mr-2" />
                      Join Meeting
                    </button>
                  )}
                  <button className="flex items-center cursor-pointer px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Calendar className="w-4 h-4 mr-2" />
                    Add to Calendar
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab === 'upcoming' ? 'upcoming' : 'past'} interviews
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {activeTab === 'upcoming' 
                ? "You don't have any scheduled interviews. Keep applying and check back soon!"
                : "You haven't completed any interviews yet. Interviews will appear here once scheduled."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}