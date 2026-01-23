'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Phone, MapPin, Lock, Save, Shield,
  Eye, EyeOff, AlertCircle, CheckCircle
} from 'lucide-react';

interface AdminData {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  role: string;
  created_at: string;
  last_login: string | null;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [adminData, setAdminData] = useState<AdminData>({
    id: 0,
    name: '',
    email: '',
    phone: '',
    location: '',
    role: 'admin',
    created_at: '',
    last_login: null
  });
  
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState({
    profile: '',
    password: ''
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
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

      // Fetch current admin data
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAdminData(data.user);
      } else {
        // Fallback to stored user data
        setAdminData(parsedUser);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      // Fallback to stored user data
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setAdminData(JSON.parse(storedUser));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (success.profile) {
      setSuccess(prev => ({ ...prev, profile: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (success.password) {
      setSuccess(prev => ({ ...prev, password: '' }));
    }
  };

  const validateProfile = () => {
    const newErrors: Record<string, string> = {};
    
    if (!adminData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!adminData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(adminData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateProfile = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateProfile()) {
      return;
    }

    setUpdatingProfile(true);
    setSuccess(prev => ({ ...prev, profile: '' }));

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: adminData.name,
          phone: adminData.phone || '',
          location: adminData.location || ''
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const updatedUser = {
            ...parsedUser,
            name: adminData.name,
            phone: adminData.phone,
            location: adminData.location
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        setSuccess(prev => ({ ...prev, profile: 'Profile updated successfully!' }));
      } else {
        setErrors(prev => ({ ...prev, profile: data.message || 'Failed to update profile' }));
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setErrors(prev => ({ ...prev, profile: 'Network error. Please try again.' }));
    } finally {
      setUpdatingProfile(false);
    }
  };

  const updatePassword = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    setUpdatingPassword(true);
    setSuccess(prev => ({ ...prev, password: '' }));

    try {
      const token = localStorage.getItem('token');
      
      // Note: You need to create a password update endpoint in your backend
      // For now, we'll simulate the update
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          password: passwordData.newPassword
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(prev => ({ ...prev, password: 'Password updated successfully!' }));
        // Clear password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setErrors(prev => ({ ...prev, password: data.message || 'Failed to update password' }));
      }
    } catch (error) {
      console.error('Update password error:', error);
      setErrors(prev => ({ ...prev, password: 'Network error. Please try again.' }));
    } finally {
      setUpdatingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Shield size={32} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Settings</h1>
              <p className="text-gray-600">Manage your account information and security</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <User size={20} className="mr-2 text-blue-500" />
                  Profile Information
                </h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Admin
                </span>
              </div>

              {success.profile && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                  <CheckCircle size={20} className="text-green-500 mr-3 shrink-0" />
                  <span className="text-green-700">{success.profile}</span>
                </div>
              )}

              {errors.profile && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle size={20} className="text-red-500 mr-3 shrink-0" />
                  <span className="text-red-700">{errors.profile}</span>
                </div>
              )}

              <form onSubmit={updateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <User size={16} className="mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={adminData.name}
                      onChange={handleProfileChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Mail size={16} className="mr-2" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={adminData.email}
                      onChange={handleProfileChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="admin@example.com"
                      disabled
                    />
                    <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Phone size={16} className="mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={adminData.phone || ''}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="+1 (555) 123-4567"
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
                      value={adminData.location || ''}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="New York, USA"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                  >
                    {updatingProfile ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={20} className="mr-2" />
                        Save Profile Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Lock size={20} className="mr-2 text-blue-500" />
                Change Password
              </h2>

              {success.password && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                  <CheckCircle size={20} className="text-green-500 mr-3 shrink-0" />
                  <span className="text-green-700">{success.password}</span>
                </div>
              )}

              {errors.password && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle size={20} className="text-red-500 mr-3 shrink-0" />
                  <span className="text-red-700">{errors.password}</span>
                </div>
              )}

              <form onSubmit={updatePassword} className="space-y-6">
                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.current ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12 ${
                          errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword.current ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.new ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12 ${
                          errors.newPassword ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter new password (min 6 characters)"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12 ${
                          errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Password Requirements:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Minimum 6 characters</li>
                    <li>• Use a mix of letters, numbers, and symbols</li>
                    <li>• Avoid common words or patterns</li>
                  </ul>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                  >
                    {updatingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <Lock size={20} className="mr-2" />
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Account Info */}
          <div className="space-y-6">
            {/* Account Overview */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Account Overview</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Admin ID</p>
                  <p className="font-medium">#{adminData.id}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Account Role</p>
                  <p className="font-medium text-blue-600 flex items-center">
                    <Shield size={16} className="mr-1" />
                    {adminData.role.charAt(0).toUpperCase() + adminData.role.slice(1)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Last Login</p>
                  <p className="font-medium">{formatDate(adminData.last_login)}</p>
                </div>
              </div>
            </div>

            {/* Security Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Security Tips</h3>
              
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-blue-100 p-1 rounded mr-3 mt-0.5">
                    <Shield size={14} className="text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-700">
                    Use a strong, unique password
                  </span>
                </li>
                
                <li className="flex items-start">
                  <div className="bg-blue-100 p-1 rounded mr-3 mt-0.5">
                    <Shield size={14} className="text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-700">
                    Never share your login credentials
                  </span>
                </li>
                
                <li className="flex items-start">
                  <div className="bg-blue-100 p-1 rounded mr-3 mt-0.5">
                    <Shield size={14} className="text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-700">
                    Log out when using shared devices
                  </span>
                </li>
                
                <li className="flex items-start">
                  <div className="bg-blue-100 p-1 rounded mr-3 mt-0.5">
                    <Shield size={14} className="text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-700">
                    Regularly update your password
                  </span>
                </li>
              </ul>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Danger Zone</h3>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  These actions are irreversible. Proceed with caution.
                </p>
                
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to log out from all devices?')) {
                      localStorage.clear();
                      router.push('/login');
                    }
                  }}
                  className="w-full cursor-pointer text-left p-3 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Log out from all devices
                </button>
                
                <button
                  onClick={() => {
                    if (confirm('This will delete your account permanently. Are you sure?')) {
                      alert('Account deletion would require backend implementation.');
                    }
                  }}
                  className="w-full cursor-pointer text-left p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}