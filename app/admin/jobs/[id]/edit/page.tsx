'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Briefcase, MapPin, DollarSign, FileText, Tag, Award, Plus, X, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
  is_active: boolean;
  experience_level: string;
}

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<Job>({
    id: 0,
    title: '',
    company: '',
    location: '',
    salary: '',
    type: 'Full-time',
    description: '',
    requirements: [],
    skills: [],
    is_active: true,
    experience_level: 'Mid'
  });

  const [currentRequirement, setCurrentRequirement] = useState('');
  const [currentSkill, setCurrentSkill] = useState('');

  // Fetch job data on mount
  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFormData(data.data);
      } else {
        console.error('Failed to fetch job:', data.message);
        setErrors(prev => ({ ...prev, fetch: 'Job not found' }));
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      setErrors(prev => ({ ...prev, fetch: 'Error loading job data' }));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addRequirement = () => {
    const req = currentRequirement.trim();
    if (req && !formData.requirements.includes(req) && formData.requirements.length < 10) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, req]
      }));
      setCurrentRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    const skill = currentSkill.trim();
    if (skill && !formData.skills.includes(skill) && formData.skills.length < 15) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.description.trim()) newErrors.description = 'Job description is required';
    if (formData.requirements.length === 0) newErrors.requirements = 'At least one requirement is needed';
    if (formData.skills.length === 0) newErrors.skills = 'At least one skill is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!data.success) {
        setErrors(prev => ({ ...prev, submit: data.message || 'Failed to update job' }));
        return;
      }

      // Success - redirect to jobs list
      router.push('/admin/jobs');

    } catch (error) {
      console.error('Update job error:', error);
      setErrors(prev => ({ ...prev, submit: 'Network error. Please try again.' }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (errors.fetch) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Job Not Found</h2>
        <p className="text-gray-600 mb-6">{errors.fetch}</p>
        <Link
          href="/admin/jobs"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Edit Job</h1>
            <p className="text-gray-600 mt-2">Update job posting: {formData.title}</p>
          </div>
          <Link
            href="/admin/jobs"
            className="text-gray-600 hover:text-gray-800 flex items-center"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Jobs
          </Link>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Job Title */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Briefcase size={16} className="mr-2" />
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Senior React Developer"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Your company name"
                />
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MapPin size={16} className="mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g., Remote, New York, etc."
                />
              </div>

              {/* Salary */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <DollarSign size={16} className="mr-2" />
                  Salary Range
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g., $100,000 - $130,000"
                />
              </div>

              {/* Job Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Award size={16} className="mr-2" />
                  Experience Level
                </label>
                <select
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                  <option value="Entry">Entry Level</option>
                  <option value="Mid">Mid Level</option>
                  <option value="Senior">Senior Level</option>
                  <option value="Lead">Lead</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>

              {/* Job Status */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-5 h-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Job is Active</span>
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  {formData.is_active 
                    ? 'This job is visible to candidates' 
                    : 'This job is hidden from candidates'}
                </p>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FileText size={16} className="mr-2" />
              Job Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe the job responsibilities, day-to-day tasks, and what makes this position exciting..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Requirements */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Requirements *
              </label>
              <span className="text-sm text-gray-500">{formData.requirements.length}/10 max</span>
            </div>
            
            <div className={`border rounded-lg p-4 ${errors.requirements ? 'border-red-300' : 'border-gray-300'}`}>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.requirements.map((req, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-blue-50 text-blue-800 px-3 py-2 rounded-lg"
                  >
                    <span>{req}</span>
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {formData.requirements.length === 0 && !errors.requirements && (
                  <p className="text-gray-500 text-sm italic">No requirements added yet</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentRequirement}
                  onChange={(e) => setCurrentRequirement(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Type a requirement and press Enter"
                  maxLength={100}
                />
                <button
                  type="button"
                  onClick={addRequirement}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
            {errors.requirements && <p className="mt-1 text-sm text-red-600">{errors.requirements}</p>}
          </div>

          {/* Skills */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Tag size={16} className="mr-2" />
                Required Skills *
              </label>
              <span className="text-sm text-gray-500">{formData.skills.length}/15 max</span>
            </div>
            
            <div className={`border rounded-lg p-4 ${errors.skills ? 'border-red-300' : 'border-gray-300'}`}>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-green-50 text-green-800 px-3 py-2 rounded-lg"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {formData.skills.length === 0 && !errors.skills && (
                  <p className="text-gray-500 text-sm italic">No skills added yet</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Type a skill (React, Python, etc.) and press Enter"
                  maxLength={50}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
            {errors.skills && <p className="mt-1 text-sm text-red-600">{errors.skills}</p>}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={20} className="mr-2" />
                  Update Job Posting
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/jobs')}
              className="flex-1 cursor-pointer border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}