'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Phone, Calendar, MapPin, Briefcase, 
  Edit, Save, X, Trash2, AlertTriangle, Shield,
  CheckCircle, Upload, Key, Globe, Linkedin, Github
} from 'lucide-react';

export default function CandidateProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    bio: '',
    linkedin: '',
    github: '',
    website: ''
  });

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!token || !storedUser) {
        router.push('/login');
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Initialize form data with user data
      setFormData({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || '',
        location: parsedUser.location || '',
        title: parsedUser.title || 'Software Developer',
        bio: parsedUser.bio || 'Passionate developer looking for new opportunities',
        linkedin: parsedUser.linkedin || '',
        github: parsedUser.github || '',
        website: parsedUser.website || ''
      });
      
      setIsLoading(false);
    };

    fetchUserData();
  }, [router]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/candidate/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Update local storage
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        // Show success message
        setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        
        // Hide message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000);
        
        // Dispatch event to update header
        window.dispatchEvent(new Event('authChange'));
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveMessage({ type: 'error', text: 'An error occurred' });
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE' || !user) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/candidate/account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Clear local storage and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('authChange'));
        router.push('/');
      } else {
        alert('Failed to delete account. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('An error occurred while deleting your account.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirmation('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Success/Error Message */}
      {saveMessage && (
        <div className={`mb-6 p-4 rounded-lg ${saveMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <div className="flex items-center">
            {saveMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertTriangle className="w-5 h-5 mr-2" />
            )}
            {saveMessage.text}
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-linear-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                  <Upload className="w-4 h-4" />
                </button>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="text-2xl font-bold bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  user?.name || 'Your Name'
                )}
              </h1>
              <p className="text-gray-600 flex items-center mt-1">
                {isEditing ? (
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    placeholder="Your title"
                  />
                ) : (
                  formData.title
                )}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 cursor-pointer bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form to original user data
                    setFormData({
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                      location: user?.location || '',
                      title: user?.title || '',
                      bio: user?.bio || '',
                      linkedin: user?.linkedin || '',
                      github: user?.github || '',
                      website: user?.website || ''
                    });
                  }}
                  className="px-4 py-2 cursor-pointer bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Personal Information
              </h2>
              <Shield className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm text-gray-500 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{user?.email}</p>
                )}
              </div>
              
              <div className="space-y-1">
                <label className="text-sm text-gray-500 flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{formData.phone || 'Not provided'}</p>
                )}
              </div>
              
              <div className="space-y-1">
                <label className="text-sm text-gray-500 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{formData.location || 'Not provided'}</p>
                )}
              </div>
              
              <div className="space-y-1">
                <label className="text-sm text-gray-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Member Since
                </label>
                <p className="text-gray-900 font-medium">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Danger Zone */}
        <div className="space-y-6">
          {/* Danger Zone */}
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6">
            <h2 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Danger Zone
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full cursor-pointer px-4 py-3 bg-red-50 text-red-700 border border-red-300 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </p>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Please type <span className="font-bold">DELETE</span> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type DELETE here"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  deleteConfirmation === 'DELETE' && !isDeleting
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-100 text-red-400 cursor-not-allowed'
                }`}
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </span>
                ) : (
                  'Delete Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}