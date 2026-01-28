'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  User, Mail, Phone, Briefcase, Calendar, 
  FileText, ChevronLeft, 
  CheckCircle, XCircle, Target, Brain,
  PieChart as PieChartIcon, AlertCircle,
  Info, Star, Award, ExternalLink,
  BarChart3, TrendingUp, Clock, ArrowLeft,
  Loader2,
  Menu, X
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Add this near your other interfaces
interface AIMatch {
  jobSkill: string;
  applicantSkill: string;
  matchType: 'exact' | 'semantic' | 'synonym';
  confidence: number;
  explanation: string;
}


interface Applicant {
  id: number;
  job_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  current_company: string | null;
  current_position: string | null;
  years_of_experience: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  cover_letter: string | null;
  skills: any[];
  cv_file_path: string | null;
  cv_file_name: string | null;
  status: string;
  application_date: string;
  aiAnalysis?: AIAnalysis;
  job?: Job;
}

interface AIAnalysis {
  skillMatch: {
    matchPercentage: number;
    matches: Array<{
      jobSkill: string;
      applicantSkill: string;
      matchType: 'exact' | 'semantic' | 'synonym';
      confidence: number;
      explanation: string;
    }>;
    jobSkills: {
      total: number;
      matched: number;
      unmatched: number;
    };
    applicantSkills: {
      total: number;
      matched: number;
      extra: number;
    };
  };
  matchBreakdown: {
    exactMatches: number;
    semanticMatches: number;
    synonymMatches: number;
  };
  recommendations: Array<{
    type: 'strong_match' | 'good_match' | 'weak_match' | 'missing_skills';
    message: string;
    action: string;
  }>;
  aiInsights?: {
    topStrengths: string[];
    areasForDevelopment: string[];
    fitScore: number;
    predictedSuccess: number;
  };
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  skills: any;
  requirements: string[];
  experience_level: string;
  description: string;
  type: string;
  salary: string;
}

interface SkillMatch {
  skill: string;
  applicantHas: boolean;
  required: boolean;
  matchLevel: number;
  matchType?: 'exact' | 'semantic' | 'synonym' | 'none';
  confidence?: number;
  explanation?: string;
}

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface MatchTimeline {
  stage: string;
  status: string;
  date: string;
  icon: React.ReactNode;
}

export default function ApplicantProfilePage() {
  const params = useParams();
  const router = useRouter();
  const applicantId = params.id as string;
  
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [skillMatches, setSkillMatches] = useState<SkillMatch[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'analysis' | 'timeline'>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [applicantId]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      setAiError('');
    
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
    
      if (!token || !storedUser) {
        router.push('/login');
        return;
      }

      // Fetch applicant
      const applicantRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/applications/${applicantId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!applicantRes.ok) {
        const errorText = await applicantRes.text();
        throw new Error(`Failed to fetch applicant: ${applicantRes.status} - ${errorText}`);
      }
    
      const applicantData = await applicantRes.json();
    
      if (!applicantData.success || !applicantData.data) {
        throw new Error('Invalid applicant data structure');
      }
    
      const fetchedApplicant = applicantData.data as Applicant;
      setApplicant(fetchedApplicant);
    
      // Fetch job
      let fetchedJob: Job | null = null;
      if (fetchedApplicant.job_id) {
        try {
          const jobRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/jobs/${fetchedApplicant.job_id}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (jobRes.ok) {
            const jobResponse = await jobRes.json();
            if (jobResponse.success) {
              fetchedJob = jobResponse.data;
              setJob(fetchedJob);
            }
          }
        } catch (jobError) {
          console.error('Error fetching job:', jobError);
        }
      }
    
      // Calculate local skill matches
      if (fetchedJob) {
        calculateFallbackSkillMatches(fetchedApplicant, fetchedJob);
      } else {
        calculateFallbackSkillMatches(fetchedApplicant, null);
      }
    
      // Start AI analysis in background (if job exists)
      if (fetchedApplicant.job_id) {
        setTimeout(() => {
          fetchAIAnalysis(applicantId, fetchedApplicant.job_id);
        }, 1000);
      }
    
    } catch (err) {
      console.error('Error in fetchData:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };



const fetchAIAnalysis = async (applicantId: string, jobId: number) => {
  try {
    setAiLoading(true);
    setAiError('');
    
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/applications/${applicantId}/analyze`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      console.log('[AI] AI analysis failed, using local matching');
      return null;
    }

    const result = await response.json();
    
    if (!result.success) {
      console.warn('[AI] AI analysis returned unsuccessful:', result.message);
      return null;
    }

    // TRUST THE BACKEND PERCENTAGE - DON'T RECALCULATE
    if (result.data?.skillMatch?.matchPercentage !== undefined) {
      setMatchPercentage(result.data.skillMatch.matchPercentage);
    }
    
    // Update applicant with AI analysis
    setApplicant(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        aiAnalysis: result.data
      };
    });

    return result.data;
    
  } catch (error) {
    console.error('[AI] Error:', error);
    return null;
  } finally {
    setAiLoading(false);
  }
};


  const normalizeSkills = (skills: any): string[] => {
    if (!skills) return [];
    
    if (Array.isArray(skills)) {
      return skills
        .map(skill => {
          if (typeof skill === 'string') {
            return skill
              .toLowerCase()
              .trim()
              .replace(/\s+/g, ' ');
          }
          if (typeof skill === 'number') return String(skill);
          if (skill && typeof skill === 'object') {
            const skillStr = skill.name || JSON.stringify(skill);
            return skillStr.toLowerCase().trim();
          }
          return '';
        })
        .filter(skill => skill.length > 0);
    }
    
    if (typeof skills === 'string') {
      try {
        if (skills.startsWith('[') && skills.endsWith(']')) {
          const parsed = JSON.parse(skills);
          if (Array.isArray(parsed)) {
            return parsed.map(s => 
              String(s)
                .toLowerCase()
                .trim()
                .replace(/\s+/g, ' ')
            ).filter(Boolean);
          }
        }
      } catch (e) {
        // If JSON parse fails, try comma separated
      }
      
      return skills
        .split(',')
        .map(skill => 
          skill
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ')
        )
        .filter(skill => skill.length > 0);
    }
    
    return [];
  };

  const formatSkillForDisplay = (skill: string): string => {
    if (!skill) return '';
    
    const originalSkill = skill.trim();
    
    return originalSkill
      .split(' ')
      .map(word => {
        const acronyms = ['UI', 'UX', 'API', 'AWS', 'SQL', 'HTML', 'CSS', 'JS', 'TS', 
                         'HTTP', 'HTTPS', 'JSON', 'XML', 'REST', 'API', 'CLI', 'GUI', 
                         'SDK', 'IDE', 'DOM', 'SEO', 'CMS', 'CRM', 'ERP', 'SaaS', 
                         'PaaS', 'IaaS', 'VPN', 'DNS', 'SSL', 'TLS', 'CI', 'CD', 'CDN'];
        const upperWord = word.toUpperCase();
        if (acronyms.includes(upperWord)) {
          return upperWord;
        }
        
        if (word.includes('-')) {
          return word
            .split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join('-');
        }
        
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };


  const calculateFallbackSkillMatches = (applicantData: Applicant, jobData: Job | null) => {
  const applicantSkills = normalizeSkills(applicantData.skills);
  const jobSkills = jobData ? normalizeSkills(jobData.skills) : [];
  
  const matches: SkillMatch[] = [];
  
  // Function to check if skills match
  const skillMatches = (skill1: string, skill2: string): boolean => {
    const s1 = skill1.toLowerCase().trim();
    const s2 = skill2.toLowerCase().trim();
    
    if (s1 === s2) return true;
    
    if (s1.includes(s2) || s2.includes(s1)) return true;
    
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    
    if (words1.some(w1 => words2.includes(w1)) ||
        words2.some(w2 => words1.includes(w2))) {
      return true;
    }
    
    return false;
  };

  // Only check job skills - don't add applicant extra skills to matches
  jobSkills.forEach(jobSkill => {
    let found = false;
    let matchType: 'exact' | 'semantic' | 'synonym' | 'none' = 'none';
    let confidence = 0;
    let matchedApplicantSkill = '';
    
    for (const appSkill of applicantSkills) {
      if (skillMatches(appSkill, jobSkill)) {
        found = true;
        matchType = appSkill.toLowerCase() === jobSkill.toLowerCase() ? 'exact' : 'semantic';
        confidence = matchType === 'exact' ? 1.0 : 0.8;
        matchedApplicantSkill = appSkill;
        break;
      }
    }
    
    matches.push({
      skill: jobSkill,
      applicantHas: found,
      required: true,
      matchLevel: found ? Math.round(confidence * 100) : 0,
      matchType,
      confidence,
      explanation: found
        ? `Applicant has "${matchedApplicantSkill}" which matches "${jobSkill}"`
        : `Applicant does not have "${jobSkill}"`
    });
  });
  
  setSkillMatches(matches);
  updateMatchStatistics(matches, jobSkills.length, applicantSkills.length);
};

  const updateMatchStatistics = (matches: SkillMatch[], totalJobSkills: number, totalApplicantSkills: number) => {
  // IMPORTANT: Filter ONLY required skills (job skills)
  const requiredSkills = matches.filter(m => m.required);
  // Count how many required skills the applicant HAS
  const matchedSkills = requiredSkills.filter(m => m.applicantHas);
  
  // Calculate percentage based on required skills only
  const percentage = requiredSkills.length > 0 
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0;
  
  setMatchPercentage(percentage);
  
  const matchedCount = matchedSkills.length;
  const missingCount = requiredSkills.length - matchedCount;
  const extraCount = matches.filter(m => !m.required).length;
  
  updateChartData(matchedCount, missingCount, extraCount);
};

  const updateChartData = (matched: number, missing: number, extra: number) => {
    const newChartData = [];
    
    if (matched > 0) {
      newChartData.push({ name: 'Matched', value: matched, color: '#10B981' });
    }
    if (missing > 0) {
      newChartData.push({ name: 'Missing', value: missing, color: '#EF4444' });
    }
    if (extra > 0) {
      newChartData.push({ name: 'Extra', value: extra, color: '#3B82F6' });
    }
    
    setChartData(newChartData);
  };


  const getSkillMatchInfo = (skill: string) => {
  if (!applicant) return { hasMatch: false, confidence: 0, matchType: 'none', explanation: 'No match found' };
  
  const localMatch = skillMatches.find(
    m => m.skill.toLowerCase() === skill.toLowerCase() && m.applicantHas && m.required
  );
  
  let aiMatch = null;
  if (applicant.aiAnalysis?.skillMatch?.matches) {
    // Look for ANY match in AI results (case insensitive)
    aiMatch = applicant.aiAnalysis.skillMatch.matches.find(
      m => m.jobSkill.toLowerCase() === skill.toLowerCase() && m.confidence > 0.3 // Lowered threshold
    );
  }
  
  return {
    hasMatch: !!localMatch || !!aiMatch,
    confidence: aiMatch?.confidence || (localMatch ? localMatch.confidence || 1 : 0),
    matchType: aiMatch?.matchType || (localMatch ? localMatch.matchType || 'exact' : 'none'),
    explanation: aiMatch?.explanation || (localMatch ? localMatch.explanation : 'No match found'),
    isAIMatch: !!aiMatch
  };
};


  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shortlisted': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'interviewing': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted': return <CheckCircle size={16} className="text-green-500" />;
      case 'rejected': return <XCircle size={16} className="text-red-500" />;
      case 'pending': return <Clock size={16} className="text-yellow-500" />;
      case 'reviewed': return <Info size={16} className="text-blue-500" />;
      case 'shortlisted': return <Star size={16} className="text-purple-500" />;
      case 'interviewing': return <Calendar size={16} className="text-indigo-500" />;
      default: return <Info size={16} className="text-gray-500" />;
    }
  };

  const getTimelineData = (): MatchTimeline[] => {
    if (!applicant) return [];
    
    return [
      {
        stage: 'Application Submitted',
        status: 'completed',
        date: formatDate(applicant.application_date),
        icon: <FileText size={16} />
      },
      {
        stage: 'Initial Review',
        status: applicant.status === 'pending' ? 'current' : 'completed',
        date: formatDate(applicant.application_date),
        icon: <Info size={16} />
      },
      {
        stage: 'Skills Assessment',
        status: applicant.status === 'reviewed' ? 'current' : 
               applicant.status === 'shortlisted' || 
               applicant.status === 'interviewing' || 
               applicant.status === 'accepted' ? 'completed' : 'pending',
        date: formatDate(applicant.application_date),
        icon: <Target size={16} />
      },
      {
        stage: 'Interview',
        status: applicant.status === 'interviewing' ? 'current' : 
               applicant.status === 'accepted' ? 'completed' : 'pending',
        date: applicant.status === 'interviewing' ? 'Scheduled' : 'Not scheduled',
        icon: <Calendar size={16} />
      },
      {
        stage: 'Decision',
        status: applicant.status === 'accepted' ? 'completed' : 
               applicant.status === 'rejected' ? 'completed' : 'pending',
        date: applicant.status === 'accepted' ? 'Accepted' : 
              applicant.status === 'rejected' ? 'Rejected' : 'Pending',
        icon: <CheckCircle size={16} />
      }
    ];
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">{data.value} skills</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading applicant profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Applicant</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/applicants')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Applicants
          </button>
        </div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <User size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Applicant Not Found</h2>
          <button
            onClick={() => router.push('/admin/applicants')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Applicants
          </button>
        </div>
      </div>
    );
  }

  const applicantSkills = normalizeSkills(applicant.skills);
  const jobSkills = job ? normalizeSkills(job.skills) : [];
  const timelineData = getTimelineData();
  const matchScore = applicant.aiAnalysis?.skillMatch.matchPercentage || matchPercentage;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center justify-between sm:justify-start space-x-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push('/admin/applicants')}
                  className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Applicant Profile</h1>
                  <p className="text-sm sm:text-base text-gray-600 truncate max-w-50 sm:max-w-none">
                    {applicant.first_name}
                  </p>
                </div>
              </div>
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
            <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:block`}>
              <span className={`px-4 py-2 rounded-full border flex items-center space-x-2 ${getStatusColor(applicant.status)}`}>
                {getStatusIcon(applicant.status)}
                <span className="font-medium text-sm sm:text-base">
                  {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                </span>
              </span>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="mt-4 pt-4 border-t border-gray-200 sm:hidden">
              <p className="text-gray-600 text-sm">
                Applied for {job?.title || `Job #${applicant.job_id}`}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Tabs - Responsive */}
        <div className="flex flex-col sm:flex-row bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Desktop Tabs - Horizontal */}
          <div className="hidden sm:flex sm:flex-row sm:space-x-1 sm:p-1 sm:w-full">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-3 px-4 rounded-md cursor-pointer text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <User size={16} />
                <span>Overview</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`flex-1 py-3 px-4 rounded-md cursor-pointer text-sm font-medium transition-colors ${
                activeTab === 'skills'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Target size={16} />
                <span>Skills Analysis</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex-1 py-3 px-4 rounded-md cursor-pointer text-sm font-medium transition-colors ${
                activeTab === 'analysis'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Brain size={16} />
                <span>AI Insights</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 py-3 px-4 rounded-md cursor-pointer text-sm font-medium transition-colors ${
                activeTab === 'timeline'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <TrendingUp size={16} />
                <span>Timeline</span>
              </div>
            </button>
          </div>

          {/* Mobile Tabs - Vertical */}
          <div className="sm:hidden flex flex-col space-y-0 divide-y divide-gray-200">
            <button
              onClick={() => {
                setActiveTab('overview');
                setMobileMenuOpen(false);
              }}
              className={`py-4 px-6 flex items-center space-x-3 cursor-pointer text-left ${
                activeTab === 'overview'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User size={20} />
              <span className="font-medium">Overview</span>
              {activeTab === 'overview' && (
                <ChevronLeft className="ml-auto transform rotate-180" size={16} />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('skills');
                setMobileMenuOpen(false);
              }}
              className={`py-4 px-6 flex items-center space-x-3 cursor-pointer text-left ${
                activeTab === 'skills'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Target size={20} />
              <span className="font-medium">Skills Analysis</span>
              {activeTab === 'skills' && (
                <ChevronLeft className="ml-auto transform rotate-180" size={16} />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('analysis');
                setMobileMenuOpen(false);
              }}
              className={`py-4 px-6 flex items-center space-x-3 cursor-pointer text-left ${
                activeTab === 'analysis'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Brain size={20} />
              <span className="font-medium">AI Insights</span>
              {activeTab === 'analysis' && (
                <ChevronLeft className="ml-auto transform rotate-180" size={16} />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('timeline');
                setMobileMenuOpen(false);
              }}
              className={`py-4 px-6 flex items-center space-x-3 cursor-pointer text-left ${
                activeTab === 'timeline'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <TrendingUp size={20} />
              <span className="font-medium">Timeline</span>
              {activeTab === 'timeline' && (
                <ChevronLeft className="ml-auto transform rotate-180" size={16} />
              )}
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Info */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <User size={18} className="mr-2 text-blue-500" />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Full Name</p>
                    <p className="font-medium text-base sm:text-lg">{applicant.first_name} {applicant.last_name}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Email Address</p>
                    <p className="font-medium text-sm sm:text-base flex items-center">
                      <Mail size={14} className="mr-2 text-gray-400" />
                      <span className="break-all">{applicant.email}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Phone Number</p>
                    <p className="font-medium text-sm sm:text-base flex items-center">
                      <Phone size={14} className="mr-2 text-gray-400" />
                      {applicant.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Applied Date</p>
                    <p className="font-medium text-sm sm:text-base flex items-center">
                      <Calendar size={14} className="mr-2 text-gray-400" />
                      {formatDate(applicant.application_date)}
                    </p>
                  </div>
                  {applicant.current_position && (
                    <div className="md:col-span-2">
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">Current Position</p>
                      <p className="font-medium text-sm sm:text-base">
                        {applicant.current_position}
                        {applicant.current_company && ` at ${applicant.current_company}`}
                      </p>
                    </div>
                  )}
                  {applicant.years_of_experience && (
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">Experience</p>
                      <p className="font-medium text-sm sm:text-base">{applicant.years_of_experience} years</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Job Information */}
              {job && (
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Briefcase size={18} className="mr-2 text-green-500" />
                    Job Applied For
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800">{job.title}</h3>
                      <p className="text-blue-600 font-medium text-sm sm:text-base">{job.company}</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">Location</p>
                        <p className="font-medium text-sm sm:text-base">{job.location}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">Type</p>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm rounded inline-block mt-1">
                          {job.type}
                        </span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-xs sm:text-sm text-gray-500">Experience Level</p>
                        <p className="font-medium text-sm sm:text-base">{job.experience_level}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-xs sm:text-sm text-gray-500">Salary</p>
                        <p className="font-medium text-sm sm:text-base">{job.salary}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 mb-2">Job Description</p>
                      <p className="text-gray-700 text-sm sm:text-base line-clamp-3">{job.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cover Letter */}
              {applicant.cover_letter && (
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Cover Letter</h2>
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6 max-h-96 overflow-y-auto">
                    <p className="text-gray-700 text-sm sm:text-base whitespace-pre-line">{applicant.cover_letter}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Quick Stats</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700 text-sm sm:text-base">Skill Match</span>
                    <span className="text-xl sm:text-2xl font-bold text-blue-600">{matchScore}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-500 h-8 sm:h-10">Job Skills</p>
                      <p className="text-lg sm:text-xl font-bold text-green-600">{jobSkills.length}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-500 h-8 sm:h-10">Applicant Skills</p>
                      <p className="text-lg sm:text-xl font-bold text-purple-600">{applicantSkills.length}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-500">Application ID</p>
                    <p className="font-mono font-medium text-sm sm:text-base">{applicant.id}</p>
                  </div>
                </div>
              </div>

              
            </div>
          </div>
        )}

        {/* Skills Analysis Tab */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-6">Skill Match Analysis</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                {/* Overall Match */}
                <div className="bg-linear-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium text-blue-800 text-sm sm:text-base">Overall Match</span>
                    <Award size={18} className="text-blue-500" />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">{matchScore}%</div>
                    <div className="text-blue-700 font-medium text-sm sm:text-base">Skill Alignment</div>
                  </div>
                  <div className="mt-4 w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${matchScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Skill Distribution */}
                <div className="bg-linear-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-xl border border-green-200 md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium text-green-800 text-sm sm:text-base">Skills Distribution</span>
                    <PieChartIcon size={18} className="text-green-500" />
                  </div>
                  <div className="h-48">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 text-sm sm:text-base">No skill data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Applicant Skills */}
                <div>
                  <h3 className="font-bold text-gray-700 mb-3 text-sm sm:text-base">Applicant's Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {applicantSkills.length > 0 ? (
                      applicantSkills.map((skill, index) => {
                        const matchInfo = getSkillMatchInfo(skill);
                        return (
                          <span 
                            key={index} 
                            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium cursor-pointer ${
                              matchInfo.hasMatch
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                            title={matchInfo.explanation}
                          >
                            {formatSkillForDisplay(skill)}
                            {matchInfo.hasMatch && (
                              <CheckCircle size={10} className="inline ml-1 text-green-600" />
                            )}
                          </span>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 text-sm">No skills listed</p>
                    )}
                  </div>
                </div>

                {/* Job Required Skills */}
                <div>
                  <h3 className="font-bold text-gray-700 mb-3 text-sm sm:text-base">Job Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {jobSkills.length > 0 ? (
                      jobSkills.map((skill, index) => {
                        const matchInfo = getSkillMatchInfo(skill);
                        return (
                          <span 
                            key={index} 
                            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium cursor-pointer ${
                              matchInfo.hasMatch
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}
                            title={matchInfo.explanation}
                          >
                            {formatSkillForDisplay(skill)}
                            {matchInfo.hasMatch ? (
                              <CheckCircle size={10} className="inline ml-1 text-green-600" />
                            ) : (
                              <XCircle size={10} className="inline ml-1 text-red-600" />
                            )}
                          </span>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 text-sm">No skills required</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Skill Analysis */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-bold text-gray-700 mb-3 text-sm sm:text-base">Detailed Skill Analysis</h3>
                <div className="space-y-2">
                  {jobSkills.map((skill, index) => {
                    const matchInfo = getSkillMatchInfo(skill);
                    return (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <span className="font-medium text-sm sm:text-base">{formatSkillForDisplay(skill)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {matchInfo.hasMatch ? (
                            <>
                              <CheckCircle size={14} className="text-green-500" />
                              <span className="text-green-600 text-xs sm:text-sm font-medium">
                                Matched
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle size={14} className="text-red-500" />
                              <span className="text-red-600 text-xs sm:text-sm font-medium">Missing</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="bg-linear-to-r from-purple-50 to-blue-50 rounded-xl shadow-sm p-4 sm:p-6 border border-purple-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center">
                  <Brain size={20} className="text-purple-500 mr-3" />
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-800">AI-Powered Analysis</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-medium">
                    {applicant.aiAnalysis ? 'AI Generated' : 'Local Analysis'}
                  </span>
                  <button
                    onClick={() => setShowAIInsights(!showAIInsights)}
                    className="p-2 hover:bg-white bg-gray-200 cursor-pointer rounded-lg transition-colors"
                  >
                    {showAIInsights ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700 text-sm sm:text-base">Overall Match Score</span>
                  <span className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {matchScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                  <div 
                    className="bg-linear-to-r from-purple-500 to-blue-500 h-2 sm:h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${matchScore}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-gray-500 mt-2">
                  <span>Low Match</span>
                  <span>Perfect Match</span>
                </div>
              </div>

              {applicant.aiAnalysis ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
                    <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-green-200">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                          <CheckCircle size={16} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-lg sm:text-2xl font-bold text-green-600">
                            {applicant.aiAnalysis.matchBreakdown.exactMatches}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">Exact Matches</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-blue-200">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <Brain size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-lg sm:text-2xl font-bold text-blue-600">
                            {applicant.aiAnalysis.matchBreakdown.semanticMatches}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">Semantic Matches</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1 bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-purple-200">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg mr-3">
                          <Target size={16} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-lg sm:text-2xl font-bold text-purple-600">
                            {applicant.aiAnalysis.matchBreakdown.synonymMatches}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">Synonym Matches</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  {showAIInsights && applicant.aiAnalysis.recommendations && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-gray-700 text-base sm:text-lg">AI Recommendations</h3>
                      <div className="space-y-3">
                        {applicant.aiAnalysis.recommendations.map((rec, index) => (
                          <div 
                            key={index}
                            className={`p-3 sm:p-4 rounded-lg border ${
                              rec.type === 'strong_match' 
                                ? 'bg-green-50 border-green-200' 
                                : rec.type === 'good_match'
                                ? 'bg-blue-50 border-blue-200'
                                : rec.type === 'weak_match'
                                ? 'bg-yellow-50 border-yellow-200'
                                : 'bg-red-50 border-red-200'
                            }`}
                          >
                            <div className="flex items-start">
                              {rec.type === 'strong_match' && (
                                <div className="p-2 bg-green-100 rounded-lg mr-3">
                                  <CheckCircle size={16} className="text-green-600" />
                                </div>
                              )}
                              {rec.type === 'good_match' && (
                                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                  <Info size={16} className="text-blue-600" />
                                </div>
                              )}
                              {rec.type === 'weak_match' && (
                                <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                                  <AlertCircle size={16} className="text-yellow-600" />
                                </div>
                              )}
                              {rec.type === 'missing_skills' && (
                                <div className="p-2 bg-red-100 rounded-lg mr-3">
                                  <XCircle size={16} className="text-red-600" />
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-gray-800 text-sm sm:text-base">{rec.message}</p>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                  <span className="font-medium">Suggested action:</span> {rec.action}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <Brain size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-600 mb-2 text-sm sm:text-base">No AI analysis available</p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Using local skill matching algorithm for analysis
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-6">Application Timeline</h2>
            
            <div className="relative">
              <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              <div className="space-y-6 sm:space-y-8">
                {timelineData.map((item, index) => (
                  <div key={index} className="relative pl-12 sm:pl-16">
                    <div className={`absolute left-4 sm:left-6 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 sm:border-4 border-white ${
                      item.status === 'completed' 
                        ? 'bg-green-500' 
                        : item.status === 'current'
                        ? 'bg-blue-500 animate-pulse'
                        : 'bg-gray-300'
                    }`}></div>
                    
                    <div className={`p-3 sm:p-4 rounded-lg border ${
                      item.status === 'completed' 
                        ? 'bg-green-50 border-green-200' 
                        : item.status === 'current'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <div className={`p-2 rounded-lg mr-3 ${
                            item.status === 'completed' 
                              ? 'bg-green-100 text-green-600' 
                              : item.status === 'current'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {item.icon}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 text-sm sm:text-base">{item.stage}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">{item.date}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${
                          item.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : item.status === 'current'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}