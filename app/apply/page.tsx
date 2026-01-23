// 'use client';

// export const dynamic = 'force-dynamic'; // <-- Add this line

// import { useState, useRef, ChangeEvent, FormEvent, KeyboardEvent, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { Upload, User, Mail, Phone, Briefcase, FileText, AlertCircle, CheckCircle, X, Tag, Loader2 } from 'lucide-react';

// interface FormData {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   currentCompany: string;
//   currentPosition: string;
//   yearsOfExperience: string;
//   linkedinUrl: string;
//   portfolioUrl: string;
//   coverLetter: string;
//   agreeToTerms: boolean;
// }

// export default function ApplyPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const jobId = searchParams.get('jobId');
  
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const skillsInputRef = useRef<HTMLInputElement>(null);
  
//   const [formData, setFormData] = useState<FormData>({
//     firstName: '',
//     lastName: '', // Will remain empty, not shown to user
//     email: '',
//     phone: '',
//     currentCompany: '',
//     currentPosition: '',
//     yearsOfExperience: '',
//     linkedinUrl: '',
//     portfolioUrl: '',
//     coverLetter: '',
//     agreeToTerms: false,
//   });

//   const [skills, setSkills] = useState<string[]>([]);
//   const [currentSkill, setCurrentSkill] = useState('');
//   const [cvFile, setCvFile] = useState<File | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitSuccess, setSubmitSuccess] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [loading, setLoading] = useState(true);
//   const [jobTitle, setJobTitle] = useState<string>('');

//   // Fetch job details and user data on mount
//   useEffect(() => {
//     // Check if user is logged in
//     const token = localStorage.getItem('token');
//     const storedUser = localStorage.getItem('user');
    
//     if (!token || !storedUser) {
//       router.push('/login');
//       return;
//     }

//     const parsedUser = JSON.parse(storedUser);
    
//     // Pre-fill user data
//     if (parsedUser) {
//       // Split full name into first name (take only first part)
//       const fullName = parsedUser.name || '';
//       const nameParts = fullName.trim().split(' ');
//       const firstName = nameParts[0] || ''; // Only first name
      
//       setFormData(prev => ({
//         ...prev,
//         firstName: firstName,
//         lastName: '', // Set empty string for lastName (will be hidden)
//         email: parsedUser.email || '',
//         phone: parsedUser.phone || '',
//         location: parsedUser.location || '' // Optional: pre-fill location if you have it
//       }));
//     }

//     // Fetch job details if jobId is provided
//     if (jobId) {
//       fetchJobDetails(jobId);
//     }

//     setLoading(false);
//   }, [router, jobId]);

//   const fetchJobDetails = async (id: string) => {
//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/jobs/${id}`, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch job details');
//       }
      
//       const data = await response.json();
//       if (data.success) {
//         setJobTitle(data.data.title);
//       }
//     } catch (error) {
//       console.error('Error fetching job details:', error);
//       setErrors(prev => ({ ...prev, job: 'Failed to load job details' }));
//     }
//   };

//   const handleInputChange = (
//     e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => {
//     const { name, value, type } = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    
//     if (type === 'checkbox') {
//       const checked = (e.target as HTMLInputElement).checked;
//       setFormData(prev => ({ ...prev, [name]: checked }));
//     } else {
//       setFormData(prev => ({ ...prev, [name]: value }));
//     }
    
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   // Handle skills input
//   const handleSkillInputChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setCurrentSkill(e.target.value);
//   };

//   const handleAddSkill = () => {
//     const skill = currentSkill.trim();
//     if (skill && !skills.includes(skill) && skills.length < 15) {
//       setSkills(prev => [...prev, skill]);
//       setCurrentSkill('');
//       if (errors.skills) {
//         setErrors(prev => ({ ...prev, skills: '' }));
//       }
//     }
//   };

//   const handleRemoveSkill = (skillToRemove: string) => {
//     setSkills(prev => prev.filter(skill => skill !== skillToRemove));
//   };

//   const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter' || e.key === ',') {
//       e.preventDefault();
//       handleAddSkill();
//     }
//   };

//   // Handle CV file upload
//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const allowedTypes = [
//       'application/pdf',
//       'application/msword',
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//       'text/plain'
//     ];
    
//     if (!allowedTypes.includes(file.type)) {
//       setErrors(prev => ({ ...prev, cv: 'Please upload PDF, DOC, DOCX, or TXT files only' }));
//       return;
//     }

//     if (file.size > 5 * 1024 * 1024) {
//       setErrors(prev => ({ ...prev, cv: 'File size should be less than 5MB' }));
//       return;
//     }

//     setCvFile(file);
//     setErrors(prev => ({ ...prev, cv: '' }));
//   };

//   const handleUploadClick = () => {
//     fileInputRef.current?.click();
//   };

//   const handleRemoveCV = () => {
//     setCvFile(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   // Form validation
//   const validateForm = () => {
//     const newErrors: Record<string, string> = {};
    
//     if (!jobId) newErrors.job = 'No job selected. Please apply from a job listing.';
//     if (!formData.firstName.trim()) newErrors.firstName = 'Name is required';
//     // No validation for lastName since we're setting it empty
//     if (!formData.email.trim()) {
//       newErrors.email = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Email is invalid';
//     }
//     if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
//     if (skills.length === 0) newErrors.skills = 'Please add at least one skill';
//     if (!cvFile) newErrors.cv = 'CV upload is required';
//     if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // In handleSubmit function, update formDataToSend:

// const handleSubmit = async (e: FormEvent) => {
//   e.preventDefault();
  
//   if (!validateForm()) {
//     return;
//   }

//   setIsSubmitting(true);

//   try {
//     const formDataToSend = new FormData();
    
//     // CRITICAL: Use snake_case field names that backend expects
//     formDataToSend.append('job_id', jobId!);
//     formDataToSend.append('first_name', formData.firstName);
//     formDataToSend.append('last_name', ''); // Empty string for last_name
//     formDataToSend.append('email', formData.email);
//     formDataToSend.append('phone', formData.phone);
//     formDataToSend.append('current_company', formData.currentCompany || '');
//     formDataToSend.append('current_position', formData.currentPosition || '');
//     formDataToSend.append('years_of_experience', formData.yearsOfExperience || '');
//     formDataToSend.append('linkedin_url', formData.linkedinUrl || '');
//     formDataToSend.append('portfolio_url', formData.portfolioUrl || '');
//     formDataToSend.append('cover_letter', formData.coverLetter || '');
//     formDataToSend.append('skills', skills.join(','));
    
//     if (cvFile) {
//       formDataToSend.append('cv', cvFile);
//     }

//     // DEBUG: Log what we're sending
//     console.log('Sending form data:');
//     console.log('job_id:', jobId);
//     console.log('first_name:', formData.firstName);
//     console.log('email:', formData.email);
//     console.log('phone:', formData.phone);
//     console.log('skills:', skills.join(','));

//     // Send to backend API
//     const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/applications`, {
//       method: 'POST',
//       body: formDataToSend,
//     });

//     const data = await response.json();

//     if (!response.ok || !data.success) {
//       throw new Error(data.message || `Submission failed (${response.status})`);
//     }
    
//     setSubmitSuccess(true);
    
//     setTimeout(() => {
//       router.push('/postings');
//     }, 2000);

//   } catch (error: any) {
//     console.error('Submission error:', error);
//     setErrors(prev => ({ 
//       ...prev, 
//       submit: error.message || 'Submission failed. Please try again.' 
//     }));
//   } finally {
//     setIsSubmitting(false);
//   }
// };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen max-w-7xl bg-linear-to-br from-gray-50 to-gray-100 mt-15 pb-12">
//       <div className="container mx-auto px-4">
//         {/* Header */}
//         <div className="text-center mb-10">
//           <h1 className="text-4xl font-bold text-gray-800 pt-8 mb-3">Job Application</h1>
//           {jobTitle && (
//             <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-block">
//               <span className="text-blue-700 font-medium">Applying for: {jobTitle}</span>
//             </div>
//           )}
//           <p className="text-gray-600 max-w-2xl mx-auto">
//             Apply for your dream job by filling out the form below. Your personal information has been pre-filled.
//           </p>
//         </div>

//         {submitSuccess ? (
//           <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-10 text-center">
//             <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
//               <CheckCircle size={40} className="text-green-600" />
//             </div>
//             <h2 className="text-2xl font-bold text-gray-800 mb-4">Application Submitted!</h2>
//             <p className="text-gray-600 mb-8">
//               Thank you for applying. We have received your application and will review it shortly.
//               You will be redirected back to the job listings in a moment.
//             </p>
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//           </div>
//         ) : (
//           <div className="max-w-4xl mx-auto">
//             <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
//               {/* Progress Bar */}
//               <div className="bg-blue-50 px-8 py-4 border-b border-gray-200">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h2 className="text-xl font-semibold text-gray-800">Application Form</h2>
//                     <p className="text-gray-500 text-sm">Complete all sections below</p>
//                   </div>
//                   <div className="text-right">
//                     <div className="text-sm text-gray-500 mb-1">Step 1 of 2</div>
//                     <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
//                       <div className="h-full bg-blue-600 w-1/2"></div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <form onSubmit={handleSubmit} className="p-8">
//                 {errors.submit && (
//                   <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
//                     <AlertCircle className="text-red-500 mr-3 mt-0.5 shrink-0" />
//                     <span className="text-red-700">{errors.submit}</span>
//                   </div>
//                 )}

//                 {errors.job && (
//                   <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//                     <p className="text-yellow-700">{errors.job}</p>
//                     <button
//                       type="button"
//                       onClick={() => router.push('/postings')}
//                       className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                     >
//                       Go to Job Listings
//                     </button>
//                   </div>
//                 )}

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                   {/* Personal Information */}
//                   <div className="space-y-6">
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//                         <User size={20} className="mr-2 text-blue-500" />
//                         Personal Information
//                       </h3>
                      
//                       <div className="space-y-4">
//                         {/* Name Field - Single Field Only */}
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Full Name *
//                           </label>
//                           <input
//                             type="text"
//                             name="firstName"
//                             value={formData.firstName}
//                             onChange={handleInputChange}
//                             className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
//                               errors.firstName ? 'border-red-300' : 'border-gray-300'
//                             }`}
//                             placeholder="John Doe"
//                           />
//                           {errors.firstName && (
//                             <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
//                           )}
//                           {/* Hidden lastName field - not shown to user */}
//                           <input
//                             type="hidden"
//                             name="lastName"
//                             value={formData.lastName}
//                           />
//                         </div>

//                         {/* Email Field */}
//                         <div>
//                           <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
//                             <Mail size={16} className="mr-1" />
//                             Email Address *
//                           </label>
//                           <input
//                             type="email"
//                             name="email"
//                             value={formData.email}
//                             onChange={handleInputChange}
//                             className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
//                               errors.email ? 'border-red-300' : 'border-gray-300'
//                             }`}
//                             placeholder="you@example.com"
//                             readOnly // Make email read-only since it's from profile
//                           />
//                           {errors.email && (
//                             <p className="mt-1 text-sm text-red-600">{errors.email}</p>
//                           )}
//                         </div>

//                         {/* Phone Field */}
//                         <div>
//                           <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
//                             <Phone size={16} className="mr-1" />
//                             Phone Number *
//                           </label>
//                           <input
//                             type="tel"
//                             name="phone"
//                             value={formData.phone}
//                             onChange={handleInputChange}
//                             className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
//                               errors.phone ? 'border-red-300' : 'border-gray-300'
//                             }`}
//                             placeholder="+1 (555) 123-4567"
//                           />
//                           {errors.phone && (
//                             <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Professional Information */}
//                   <div className="space-y-6">
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//                         <Briefcase size={20} className="mr-2 text-blue-500" />
//                         Professional Information
//                       </h3>
                      
//                       <div className="space-y-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Current Company
//                           </label>
//                           <input
//                             type="text"
//                             name="currentCompany"
//                             value={formData.currentCompany}
//                             onChange={handleInputChange}
//                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
//                             placeholder="TechCorp Inc."
//                           />
//                         </div>

//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Current Position
//                           </label>
//                           <input
//                             type="text"
//                             name="currentPosition"
//                             value={formData.currentPosition}
//                             onChange={handleInputChange}
//                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
//                             placeholder="Senior Developer"
//                           />
//                         </div>

//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Years of Experience
//                           </label>
//                           <select
//                             name="yearsOfExperience"
//                             value={formData.yearsOfExperience}
//                             onChange={handleInputChange}
//                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
//                           >
//                             <option value="">Select experience</option>
//                             <option value="0-2">0-2 years</option>
//                             <option value="2-5">2-5 years</option>
//                             <option value="5-10">5-10 years</option>
//                             <option value="10+">10+ years</option>
//                           </select>
//                         </div>

//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             LinkedIn Profile URL
//                           </label>
//                           <input
//                             type="url"
//                             name="linkedinUrl"
//                             value={formData.linkedinUrl}
//                             onChange={handleInputChange}
//                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
//                             placeholder="https://linkedin.com/in/yourprofile"
//                           />
//                         </div>

//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Portfolio/Website URL
//                           </label>
//                           <input
//                             type="url"
//                             name="portfolioUrl"
//                             value={formData.portfolioUrl}
//                             onChange={handleInputChange}
//                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
//                             placeholder="https://yourportfolio.com"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Skills Section */}
//                 <div className="mt-10">
//                   <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//                     <Tag size={20} className="mr-2 text-blue-500" />
//                     Skills & Expertise *
//                   </h3>
                  
//                   <div className={`border rounded-xl p-4 transition-colors ${
//                     errors.skills ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                   }`}>
//                     <div className="flex flex-wrap gap-2 mb-4">
//                       {skills.map((skill, index) => (
//                         <div
//                           key={index}
//                           className="flex items-center bg-blue-100 text-blue-800 px-3 py-2 rounded-lg"
//                         >
//                           <span className="mr-2">{skill}</span>
//                           <button
//                             type="button"
//                             onClick={() => handleRemoveSkill(skill)}
//                             className="text-blue-600 hover:text-blue-800"
//                           >
//                             <X size={14} />
//                           </button>
//                         </div>
//                       ))}
//                       {skills.length === 0 && !errors.skills && (
//                         <p className="text-gray-500 text-sm italic">No skills added yet</p>
//                       )}
//                     </div>
                    
//                     <div className="flex gap-2">
//                       <input
//                         ref={skillsInputRef}
//                         type="text"
//                         value={currentSkill}
//                         onChange={handleSkillInputChange}
//                         onKeyDown={handleSkillKeyDown}
//                         className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                         placeholder="Type a skill (e.g., React, Python, Project Management) and press Enter"
//                         maxLength={50}
//                       />
//                       <button
//                         type="button"
//                         onClick={handleAddSkill}
//                         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                       >
//                         Add
//                       </button>
//                     </div>
                    
//                     <div className="mt-3 flex justify-between text-sm">
//                       <div>
//                         <span className="text-gray-600">
//                           Added: {skills.length} skill{skills.length !== 1 ? 's' : ''}
//                         </span>
//                         {skills.length >= 15 && (
//                           <span className="ml-2 text-amber-600">Maximum 15 skills reached</span>
//                         )}
//                       </div>
//                       <div className="text-gray-500">
//                         Press Enter or comma to add
//                       </div>
//                     </div>
//                   </div>
                  
//                   {errors.skills && (
//                     <p className="mt-2 text-sm text-red-600">{errors.skills}</p>
//                   )}
                  
//                   <div className="mt-3 text-sm text-gray-600">
//                     <p>💡 Add relevant technical skills, tools, methodologies, or soft skills that match the job requirements.</p>
//                   </div>
//                 </div>

//                 {/* CV Upload Section */}
//                 <div className="mt-10">
//                   <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//                     <Upload size={20} className="mr-2 text-blue-500" />
//                     CV / Resume Upload *
//                   </h3>
                  
//                   <input
//                     type="file"
//                     ref={fileInputRef}
//                     onChange={handleFileChange}
//                     accept=".pdf,.doc,.docx,.txt"
//                     className="hidden"
//                   />
                  
//                   {!cvFile ? (
//                     <div 
//                       onClick={handleUploadClick}
//                       className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-blue-400 hover:bg-blue-50 ${
//                         errors.cv ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                       }`}
//                     >
//                       <Upload size={48} className={`mx-auto mb-4 ${errors.cv ? 'text-red-400' : 'text-gray-400'}`} />
//                       <p className={`text-lg font-medium mb-2 ${errors.cv ? 'text-red-700' : 'text-gray-700'}`}>
//                         Click to upload your CV
//                       </p>
//                       <p className="text-gray-500 text-sm">
//                         Supports PDF, DOC, DOCX, TXT (Max 5MB)
//                       </p>
//                     </div>
//                   ) : (
//                     <div className="border border-green-300 bg-green-50 rounded-xl p-6">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center">
//                           <FileText size={24} className="text-green-600 mr-3" />
//                           <div>
//                             <p className="font-medium text-green-800">{cvFile.name}</p>
//                             <p className="text-green-600 text-sm">
//                               {(cvFile.size / 1024 / 1024).toFixed(2)} MB • {
//                                 cvFile.type === 'application/pdf' ? 'PDF' : 
//                                 cvFile.type.includes('word') ? 'Word Document' : 'Text File'
//                               }
//                             </p>
//                           </div>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={handleRemoveCV}
//                           className="text-red-600 hover:text-red-800 font-medium text-sm"
//                         >
//                           Remove
//                         </button>
//                       </div>
//                     </div>
//                   )}
                  
//                   {errors.cv && (
//                     <p className="mt-2 text-sm text-red-600">{errors.cv}</p>
//                   )}
//                 </div>

//                 {/* Cover Letter */}
//                 <div className="mt-10">
//                   <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//                     <FileText size={20} className="mr-2 text-blue-500" />
//                     Cover Letter (Optional)
//                   </h3>
//                   <textarea
//                     name="coverLetter"
//                     value={formData.coverLetter}
//                     onChange={handleInputChange}
//                     rows={5}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
//                     placeholder="Tell us why you're interested in this position and why you'd be a great fit..."
//                     maxLength={1000}
//                   />
//                   <p className="mt-2 text-sm text-gray-500">
//                     Maximum 1000 characters. {formData.coverLetter.length}/1000
//                   </p>
//                 </div>

//                 {/* Terms & Conditions */}
//                 <div className="mt-10 p-4 bg-blue-50 rounded-lg">
//                   <div className="flex items-start">
//                     <input
//                       type="checkbox"
//                       id="agreeToTerms"
//                       name="agreeToTerms"
//                       checked={formData.agreeToTerms}
//                       onChange={handleInputChange}
//                       className="mt-1 mr-3 cursor-pointer"
//                     />
//                     <label htmlFor="agreeToTerms" className="text-gray-700">
//                       I agree to the{' '}
//                       <a href="/terms" className="text-blue-600 hover:text-blue-800 underline">
//                         Terms and Conditions
//                       </a>{' '}
//                       and acknowledge that my data will be processed in accordance with the{' '}
//                       <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
//                         Privacy Policy
//                       </a>. *
//                     </label>
//                   </div>
//                   {errors.agreeToTerms && (
//                     <p className="mt-2 text-sm text-red-600">{errors.agreeToTerms}</p>
//                   )}
//                 </div>

//                 {/* Submit Button */}
//                 <div className="mt-10 flex flex-col sm:flex-row gap-4">
//                   <button
//                     type="submit"
//                     disabled={isSubmitting || !jobId}
//                     className="flex-1 cursor-pointer bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
//                   >
//                     {isSubmitting ? (
//                       <>
//                         <Loader2 size={20} className="animate-spin mr-3" />
//                         Submitting Application...
//                       </>
//                     ) : (
//                       'Submit Application'
//                     )}
//                   </button>
//                 </div>
//                 <button
//                     type="button"
//                     onClick={() => router.back()}
//                     className="px-6 py-3 w-full mt-4 cursor-pointer border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//                   >
//                     Cancel
//                   </button>

//                 <div className="mt-6 text-center text-gray-500 text-sm">
//                   <p>Your application will be reviewed within 3-5 business days</p>
//                   <p className="mt-1">You will receive a confirmation email at {formData.email}</p>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }










'use client';

// 1. FORCE dynamic rendering - prevents static prerendering
// export const dynamic = 'force-dynamic';
// 2. DISABLE static generation - more explicit approach for this page
// export const revalidate = 0;

import { useState, useRef, ChangeEvent, FormEvent, KeyboardEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload, User, Mail, Phone, Briefcase, FileText, AlertCircle, CheckCircle, X, Tag, Loader2 } from 'lucide-react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentCompany: string;
  currentPosition: string;
  yearsOfExperience: string;
  linkedinUrl: string;
  portfolioUrl: string;
  coverLetter: string;
  agreeToTerms: boolean;
}

export default function ApplyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const skillsInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '', // Will remain empty, not shown to user
    email: '',
    phone: '',
    currentCompany: '',
    currentPosition: '',
    yearsOfExperience: '',
    linkedinUrl: '',
    portfolioUrl: '',
    coverLetter: '',
    agreeToTerms: false,
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState<string>('');

  // Fetch job details and user data on mount
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    
    // Pre-fill user data
    if (parsedUser) {
      // Split full name into first name (take only first part)
      const fullName = parsedUser.name || '';
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || ''; // Only first name
      
      setFormData(prev => ({
        ...prev,
        firstName: firstName,
        lastName: '', // Set empty string for lastName (will be hidden)
        email: parsedUser.email || '',
        phone: parsedUser.phone || '',
        location: parsedUser.location || '' // Optional: pre-fill location if you have it
      }));
    }

    // Fetch job details if jobId is provided
    if (jobId) {
      fetchJobDetails(jobId);
    }

    setLoading(false);
  }, [router, jobId]);

  const fetchJobDetails = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/jobs/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch job details');
      }
      
      const data = await response.json();
      if (data.success) {
        setJobTitle(data.data.title);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      setErrors(prev => ({ ...prev, job: 'Failed to load job details' }));
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    
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

  // Handle skills input
  const handleSkillInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentSkill(e.target.value);
  };

  const handleAddSkill = () => {
    const skill = currentSkill.trim();
    if (skill && !skills.includes(skill) && skills.length < 15) {
      setSkills(prev => [...prev, skill]);
      setCurrentSkill('');
      if (errors.skills) {
        setErrors(prev => ({ ...prev, skills: '' }));
      }
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(skill => skill !== skillToRemove));
  };

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // Handle CV file upload
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, cv: 'Please upload PDF, DOC, DOCX, or TXT files only' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, cv: 'File size should be less than 5MB' }));
      return;
    }

    setCvFile(file);
    setErrors(prev => ({ ...prev, cv: '' }));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveCV = () => {
    setCvFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!jobId) newErrors.job = 'No job selected. Please apply from a job listing.';
    if (!formData.firstName.trim()) newErrors.firstName = 'Name is required';
    // No validation for lastName since we're setting it empty
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (skills.length === 0) newErrors.skills = 'Please add at least one skill';
    if (!cvFile) newErrors.cv = 'CV upload is required';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // In handleSubmit function, update formDataToSend:

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  setIsSubmitting(true);

  try {
    const formDataToSend = new FormData();
    
    // CRITICAL: Use snake_case field names that backend expects
    formDataToSend.append('job_id', jobId!);
    formDataToSend.append('first_name', formData.firstName);
    formDataToSend.append('last_name', ''); // Empty string for last_name
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('current_company', formData.currentCompany || '');
    formDataToSend.append('current_position', formData.currentPosition || '');
    formDataToSend.append('years_of_experience', formData.yearsOfExperience || '');
    formDataToSend.append('linkedin_url', formData.linkedinUrl || '');
    formDataToSend.append('portfolio_url', formData.portfolioUrl || '');
    formDataToSend.append('cover_letter', formData.coverLetter || '');
    formDataToSend.append('skills', skills.join(','));
    
    if (cvFile) {
      formDataToSend.append('cv', cvFile);
    }

    // DEBUG: Log what we're sending
    console.log('Sending form data:');
    console.log('job_id:', jobId);
    console.log('first_name:', formData.firstName);
    console.log('email:', formData.email);
    console.log('phone:', formData.phone);
    console.log('skills:', skills.join(','));

    // Send to backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/applications`, {
      method: 'POST',
      body: formDataToSend,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || `Submission failed (${response.status})`);
    }
    
    setSubmitSuccess(true);
    
    setTimeout(() => {
      router.push('/postings');
    }, 2000);

  } catch (error: any) {
    console.error('Submission error:', error);
    setErrors(prev => ({ 
      ...prev, 
      submit: error.message || 'Submission failed. Please try again.' 
    }));
  } finally {
    setIsSubmitting(false);
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
    <div className="min-h-screen max-w-7xl bg-linear-to-br from-gray-50 to-gray-100 mt-15 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 pt-8 mb-3">Job Application</h1>
          {jobTitle && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-block">
              <span className="text-blue-700 font-medium">Applying for: {jobTitle}</span>
            </div>
          )}
          <p className="text-gray-600 max-w-2xl mx-auto">
            Apply for your dream job by filling out the form below. Your personal information has been pre-filled.
          </p>
        </div>

        {submitSuccess ? (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Application Submitted!</h2>
            <p className="text-gray-600 mb-8">
              Thank you for applying. We have received your application and will review it shortly.
              You will be redirected back to the job listings in a moment.
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Progress Bar */}
              <div className="bg-blue-50 px-8 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Application Form</h2>
                    <p className="text-gray-500 text-sm">Complete all sections below</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">Step 1 of 2</div>
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8">
                {errors.submit && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="text-red-500 mr-3 mt-0.5 shrink-0" />
                    <span className="text-red-700">{errors.submit}</span>
                  </div>
                )}

                {errors.job && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-700">{errors.job}</p>
                    <button
                      type="button"
                      onClick={() => router.push('/postings')}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Go to Job Listings
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <User size={20} className="mr-2 text-blue-500" />
                        Personal Information
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Name Field - Single Field Only */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                              errors.firstName ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="John Doe"
                          />
                          {errors.firstName && (
                            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                          )}
                          {/* Hidden lastName field - not shown to user */}
                          <input
                            type="hidden"
                            name="lastName"
                            value={formData.lastName}
                          />
                        </div>

                        {/* Email Field */}
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <Mail size={16} className="mr-1" />
                            Email Address *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                              errors.email ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="you@example.com"
                            readOnly // Make email read-only since it's from profile
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                          )}
                        </div>

                        {/* Phone Field */}
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <Phone size={16} className="mr-1" />
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                              errors.phone ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="+1 (555) 123-4567"
                          />
                          {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Briefcase size={20} className="mr-2 text-blue-500" />
                        Professional Information
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Company
                          </label>
                          <input
                            type="text"
                            name="currentCompany"
                            value={formData.currentCompany}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            placeholder="TechCorp Inc."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Position
                          </label>
                          <input
                            type="text"
                            name="currentPosition"
                            value={formData.currentPosition}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            placeholder="Senior Developer"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Years of Experience
                          </label>
                          <select
                            name="yearsOfExperience"
                            value={formData.yearsOfExperience}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
                          >
                            <option value="">Select experience</option>
                            <option value="0-2">0-2 years</option>
                            <option value="2-5">2-5 years</option>
                            <option value="5-10">5-10 years</option>
                            <option value="10+">10+ years</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            LinkedIn Profile URL
                          </label>
                          <input
                            type="url"
                            name="linkedinUrl"
                            value={formData.linkedinUrl}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            placeholder="https://linkedin.com/in/yourprofile"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Portfolio/Website URL
                          </label>
                          <input
                            type="url"
                            name="portfolioUrl"
                            value={formData.portfolioUrl}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            placeholder="https://yourportfolio.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Section */}
                <div className="mt-10">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Tag size={20} className="mr-2 text-blue-500" />
                    Skills & Expertise *
                  </h3>
                  
                  <div className={`border rounded-xl p-4 transition-colors ${
                    errors.skills ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {skills.map((skill, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-blue-100 text-blue-800 px-3 py-2 rounded-lg"
                        >
                          <span className="mr-2">{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      {skills.length === 0 && !errors.skills && (
                        <p className="text-gray-500 text-sm italic">No skills added yet</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <input
                        ref={skillsInputRef}
                        type="text"
                        value={currentSkill}
                        onChange={handleSkillInputChange}
                        onKeyDown={handleSkillKeyDown}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Type a skill (e.g., React, Python, Project Management) and press Enter"
                        maxLength={50}
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    
                    <div className="mt-3 flex justify-between text-sm">
                      <div>
                        <span className="text-gray-600">
                          Added: {skills.length} skill{skills.length !== 1 ? 's' : ''}
                        </span>
                        {skills.length >= 15 && (
                          <span className="ml-2 text-amber-600">Maximum 15 skills reached</span>
                        )}
                      </div>
                      <div className="text-gray-500">
                        Press Enter or comma to add
                      </div>
                    </div>
                  </div>
                  
                  {errors.skills && (
                    <p className="mt-2 text-sm text-red-600">{errors.skills}</p>
                  )}
                  
                  <div className="mt-3 text-sm text-gray-600">
                    <p>💡 Add relevant technical skills, tools, methodologies, or soft skills that match the job requirements.</p>
                  </div>
                </div>

                {/* CV Upload Section */}
                <div className="mt-10">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Upload size={20} className="mr-2 text-blue-500" />
                    CV / Resume Upload *
                  </h3>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                  />
                  
                  {!cvFile ? (
                    <div 
                      onClick={handleUploadClick}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-blue-400 hover:bg-blue-50 ${
                        errors.cv ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <Upload size={48} className={`mx-auto mb-4 ${errors.cv ? 'text-red-400' : 'text-gray-400'}`} />
                      <p className={`text-lg font-medium mb-2 ${errors.cv ? 'text-red-700' : 'text-gray-700'}`}>
                        Click to upload your CV
                      </p>
                      <p className="text-gray-500 text-sm">
                        Supports PDF, DOC, DOCX, TXT (Max 5MB)
                      </p>
                    </div>
                  ) : (
                    <div className="border border-green-300 bg-green-50 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText size={24} className="text-green-600 mr-3" />
                          <div>
                            <p className="font-medium text-green-800">{cvFile.name}</p>
                            <p className="text-green-600 text-sm">
                              {(cvFile.size / 1024 / 1024).toFixed(2)} MB • {
                                cvFile.type === 'application/pdf' ? 'PDF' : 
                                cvFile.type.includes('word') ? 'Word Document' : 'Text File'
                              }
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCV}
                          className="text-red-600 hover:text-red-800 font-medium text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {errors.cv && (
                    <p className="mt-2 text-sm text-red-600">{errors.cv}</p>
                  )}
                </div>

                {/* Cover Letter */}
                <div className="mt-10">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FileText size={20} className="mr-2 text-blue-500" />
                    Cover Letter (Optional)
                  </h3>
                  <textarea
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="Tell us why you're interested in this position and why you'd be a great fit..."
                    maxLength={1000}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Maximum 1000 characters. {formData.coverLetter.length}/1000
                  </p>
                </div>

                {/* Terms & Conditions */}
                <div className="mt-10 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="agreeToTerms"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className="mt-1 mr-3 cursor-pointer"
                    />
                    <label htmlFor="agreeToTerms" className="text-gray-700">
                      I agree to the{' '}
                      <a href="/terms" className="text-blue-600 hover:text-blue-800 underline">
                        Terms and Conditions
                      </a>{' '}
                      and acknowledge that my data will be processed in accordance with the{' '}
                      <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                        Privacy Policy
                      </a>. *
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="mt-2 text-sm text-red-600">{errors.agreeToTerms}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || !jobId}
                    className="flex-1 cursor-pointer bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={20} className="animate-spin mr-3" />
                        Submitting Application...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </div>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 w-full mt-4 cursor-pointer border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>

                <div className="mt-6 text-center text-gray-500 text-sm">
                  <p>Your application will be reviewed within 3-5 business days</p>
                  <p className="mt-1">You will receive a confirmation email at {formData.email}</p>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}