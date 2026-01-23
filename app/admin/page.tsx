'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, UserCheck, UserX, Shield, BarChart3, 
  TrendingUp, FileText, Settings
} from 'lucide-react';

interface Stats {
  totalApplicants: number;
  accepted: number;
  rejected: number;
  totalJobs: number;
  activeJobs: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalApplicants: 0,
    accepted: 0,
    rejected: 0,
    totalJobs: 0,
    activeJobs: 0
  });
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    // Check if user is logged in and is admin
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

    fetchDashboardData(token);
  }, [router]);

  const fetchDashboardData = async (token: string) => {
    try {
      setLoading(true);
      
      // Fetch applicants for stats
      const applicantsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/applications`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Fetch jobs for stats
      const jobsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/jobs`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (applicantsRes.ok && jobsRes.ok) {
        const applicantsData = await applicantsRes.json();
        const jobsData = await jobsRes.json();

        // Calculate stats
        let totalApplicants = 0;
        let accepted = 0;
        let rejected = 0;
        
        if (applicantsData.success) {
          totalApplicants = applicantsData.data.length;
          accepted = applicantsData.data.filter((app: any) => app.status === 'accepted').length;
          rejected = applicantsData.data.filter((app: any) => app.status === 'rejected').length;
        }

        // Calculate job stats
        let totalJobs = 0;
        let activeJobs = 0;
        
        if (jobsData.success) {
          totalJobs = jobsData.data.length;
          activeJobs = jobsData.data.filter((job: any) => job.is_active).length;
        }

        setStats({
          totalApplicants,
          accepted,
          rejected,
          totalJobs,
          activeJobs
        });

      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-5 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Shield size={32} className="text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-600">Administrative Control Center</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Applicants Card */}
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Applicants</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.totalApplicants}</h3>
                <p className="text-gray-500 text-sm mt-1">All time applications</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-600">
                <TrendingUp size={16} className="mr-2" />
                <span>View all applicants</span>
              </div>
            </div>
          </div>

          {/* Accepted Applicants Card */}
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Accepted</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.accepted}</h3>
                <p className="text-green-600 text-sm mt-1">Successful applications</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <UserCheck size={24} className="text-green-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-600">
                <BarChart3 size={16} className="mr-2" />
                <span>{stats.totalApplicants > 0 ? `${((stats.accepted / stats.totalApplicants) * 100).toFixed(1)}% acceptance rate` : 'No data'}</span>
              </div>
            </div>
          </div>

          {/* Rejected Applicants Card */}
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Rejected</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.rejected}</h3>
                <p className="text-red-600 text-sm mt-1">Unsuccessful applications</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <UserX size={24} className="text-red-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-600">
                <BarChart3 size={16} className="mr-2" />
                <span>{stats.totalApplicants > 0 ? `${((stats.rejected / stats.totalApplicants) * 100).toFixed(1)}% rejection rate` : 'No data'}</span>
              </div>
            </div>
          </div>
        </div>

        

        {/* Additional Info Section */}
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <Shield size={20} className="mr-2 text-blue-500" />
            Platform Security & Guidelines
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Shield size={20} className="text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-800">Data Protection</h3>
              </div>
              <p className="text-gray-600 text-sm">
                All candidate data is encrypted and stored securely. Regular backups ensure data integrity and protection against loss.
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <Users size={20} className="text-green-600" />
                </div>
                <h3 className="font-bold text-gray-800">Candidate Privacy</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Personal information is handled with confidentiality. Access to candidate data is restricted to authorized personnel only.
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <FileText size={20} className="text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-800">Compliance Standards</h3>
              </div>
              <p className="text-gray-600 text-sm">
                The platform adheres to recruitment industry standards and data protection regulations for fair hiring practices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}