import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL, SEMESTERS_MAP, OTHERS_FOLDER, getSemesterSubjects } from '../config';
import { UploadCloud, FileText, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const Upload = () => {
  const { isAuthenticated, authFetch } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form states
  const [title, setTitle] = useState('');
  const [semester, setSemester] = useState('1st');
  const [subject, setSubject] = useState(SEMESTERS_MAP['1st'][0]);
  const [type, setType] = useState('Notes');
  const [file, setFile] = useState(null);

  // Automatically update subject when semester changes
  const handleSemesterChange = (newSem) => {
    setSemester(newSem);
    if (subject === OTHERS_FOLDER) {
      setSubject(OTHERS_FOLDER);
    } else if (SEMESTERS_MAP[newSem]) {
      setSubject(SEMESTERS_MAP[newSem][0]);
    }
  };

  // Status states
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Protect route
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=upload');
    }
  }, [isAuthenticated, navigate]);

  // Handle Drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle Drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // Handle File Input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  // Validate that file is a PDF, Word, or PowerPoint document under 10MB
  const validateAndSetFile = (selectedFile) => {
    setError(null);
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
    const ext = '.' + selectedFile.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setError('Only PDF, Word (.doc, .docx), and PowerPoint (.ppt, .pptx) documents are allowed.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum file size allowed is 10MB.');
      return;
    }
    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic Validations
    if (!title.trim() || !subject.trim() || !semester || !type) {
      setError('Please fill in all form fields.');
      return;
    }
    if (!file) {
      setError('Please select a document file to upload (PDF, Word, or PowerPoint).');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('subject', subject.trim());
    formData.append('semester', semester);
    formData.append('type', type);
    formData.append('pdf', file);

    try {
      setUploading(true);
      
      // Upload using our authenticated fetch wrapper
      const response = await authFetch(`${API_URL}/api/notes/upload`, {
        method: 'POST',
        body: formData, // Browser sets multipart boundary automatically
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload note.');
      }

      setSuccess(true);
      
      // Wait for 1.5 seconds to show success card, then redirect to the note page
      setTimeout(() => {
        navigate(`/notes/${data.note._id}`);
      }, 1500);

    } catch (err) {
      console.error('Error in file upload form:', err);
      setError(err.message || 'An error occurred during note upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Banner Header */}
        <div className="gradient-bg text-white px-8 py-8 text-center relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <UploadCloud className="h-10 w-10 text-ucp-gold mx-auto mb-3" />
          <h1 className="text-2xl font-extrabold">Upload Study Material</h1>
          <p className="text-slate-300 text-sm mt-1">Share lecture slides, midterm preps, and past exam papers.</p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Status alerts */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm font-semibold">{error}</div>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm font-semibold">Note uploaded successfully! Redirecting to preview page...</div>
            </div>
          )}

          {/* File Drag & Drop */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Select Study Document</label>
            
            {!file ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  dragActive 
                    ? 'border-ucp-blue bg-blue-50/50 scale-[0.99]' 
                    : 'border-slate-300 hover:border-ucp-blue hover:bg-slate-50/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  className="hidden"
                />
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-700 font-bold text-sm">Drag & drop your document file here</p>
                <p className="text-slate-400 text-xs mt-1">Accepts PDF, Word, and PowerPoint (Max 10MB)</p>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3 truncate">
                  <div className="bg-rose-100 text-rose-600 p-2.5 rounded-lg flex-shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-bold text-slate-700 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-400 font-medium">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Text fields */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
                Document Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midterm Preparation Sheet - OOP"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-ucp-blue focus:ring-1 focus:ring-ucp-blue text-sm"
              />
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
                Subject / Course Name
              </label>
              <select
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-ucp-blue focus:ring-1 focus:ring-ucp-blue text-sm font-semibold"
              >
                {getSemesterSubjects(semester).map((sub) => (
                  <option key={sub} value={sub}>
                    {sub === OTHERS_FOLDER ? 'Others (not listed above)' : sub}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 font-medium mt-1.5">
                Choose <span className="font-bold text-slate-500">Others</span> if this document does not belong to any course above.
              </p>
            </div>

            {/* Grid for Semester and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Semester */}
              <div>
                <label htmlFor="semester" className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
                  Semester
                </label>
                <select
                  id="semester"
                  value={semester}
                  onChange={(e) => handleSemesterChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-ucp-blue focus:ring-1 focus:ring-ucp-blue text-sm font-semibold"
                >
                  {Object.keys(SEMESTERS_MAP).map((sem) => (
                    <option key={sem} value={sem}>{sem} Semester</option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label htmlFor="type" className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
                  Material Type
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-ucp-blue focus:ring-1 focus:ring-ucp-blue text-sm font-semibold"
                >
                  <option value="Notes">Notes / Slides</option>
                  <option value="Past Papers">Past Papers</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || success}
            className="flex items-center justify-center space-x-2 w-full py-3.5 bg-ucp-blue text-white rounded-xl text-sm font-bold shadow-md hover:bg-ucp-dark hover:shadow-lg disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.99]"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading Document...</span>
              </>
            ) : (
              <span>Upload Document</span>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default Upload;
