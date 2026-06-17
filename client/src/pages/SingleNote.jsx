import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API_URL, getNoteFileUrl } from '../config';
import { useAuth } from '../context/AuthContext';
import { Calendar, Download, Eye, FileText, FolderOpen, ArrowLeft, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

const SingleNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, authFetch, refreshProfile } = useAuth();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadError, setDownloadError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchNoteDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/api/notes/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Note not found. It may have been removed.');
          }
          throw new Error('Failed to retrieve note details.');
        }

        const data = await response.json();
        setNote(data);
      } catch (err) {
        console.error('Error fetching note details:', err);
        setError(err.message || 'Could not load note details.');
      } finally {
        setLoading(false);
      }
    };

    fetchNoteDetails();
  }, [id]);

  const handleDownload = async () => {
    if (!note) return;

    if (!isAuthenticated) {
      navigate(`/login?redirect=notes/${note._id}`);
      return;
    }

    try {
      setDownloading(true);
      setDownloadError(null);

      const res = await authFetch(`${API_URL}/api/notes/${note._id}/download`, {
        method: 'POST'
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.limitExceeded) {
          setDownloadError(data.message);
          return;
        }
        throw new Error(data.message || 'Download failed.');
      }

      setNote((prev) => ({
        ...prev,
        downloads: data.downloads
      }));
      refreshProfile();

      const fileUrl = data.fileUrl?.startsWith('/api/')
        ? `${API_URL}${data.fileUrl}`
        : getNoteFileUrl(note._id);

      window.open(fileUrl, '_blank');
    } catch (err) {
      console.error('Error handling note download:', err);
      setDownloadError(err.message || 'Could not download this document.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-ucp-blue mx-auto" />
          <p className="text-slate-500 font-semibold text-sm">Loading document preview...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-md mx-auto bg-white border border-slate-100 p-8 rounded-3xl text-center shadow-sm">
          <FileText className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Error</h2>
          <p className="text-slate-500 font-medium text-sm mt-2">{error || 'Note not found.'}</p>
          <Link
            to="/browse"
            className="inline-flex items-center space-x-2 mt-6 px-6 py-2.5 bg-ucp-blue text-white rounded-xl text-sm font-bold shadow-md hover:bg-ucp-dark transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Browse</span>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="mb-6">
          <Link to="/browse" className="inline-flex items-center space-x-2 text-sm font-bold text-slate-500 hover:text-ucp-blue transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Browse</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-4">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-ucp-blue" />
                  <span className="font-bold text-slate-800">Document Preview</span>
                </div>

                <a
                  href={getNoteFileUrl(note._id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors"
                >
                  <span>Open Fullscreen</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 h-[650px]">
                {note.fileUrl && !/\.(docx|doc|pptx|ppt)$/i.test(note.fileUrl) ? (
                  <iframe
                    src={`${getNoteFileUrl(note._id)}#toolbar=0`}
                    title={note.title}
                    width="100%"
                    height="100%"
                    className="border-none"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <FileText className="h-16 w-16 text-slate-300 mb-3" />
                    <p className="text-slate-500 font-bold text-sm">Preview Unavailable</p>
                    <p className="text-slate-400 text-xs mt-1">
                      {note.fileUrl ? 'Preview is not supported for Word or PowerPoint files in the browser. Please download the document to view its contents.' : 'This document cannot be previewed in this browser.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-sky-50 text-sky-700 border border-sky-100 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    {note.semester} Semester
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    {note.type}
                  </span>
                </div>
                <h1 className="text-2xl font-extrabold text-slate-800 leading-tight">
                  {note.title}
                </h1>
              </div>

              <div className="pt-2 space-y-3">
                {downloadError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-bold">{downloadError}</p>
                  </div>
                )}

                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center justify-center space-x-2.5 w-full py-4 bg-ucp-blue text-white rounded-2xl text-base font-extrabold shadow-md hover:bg-ucp-dark hover:shadow-lg active:scale-[0.99] disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      <span>{isAuthenticated ? 'Download PDF' : 'Sign in to Download'}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="border-t border-b border-slate-100 py-6 space-y-4">

                <div className="flex items-start space-x-3">
                  <div className="bg-slate-50 text-slate-500 p-2.5 rounded-xl border border-slate-100">
                    <FolderOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Course / Subject</span>
                    <span className="text-sm font-bold text-slate-700">{note.subject}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-slate-50 text-slate-500 p-2.5 rounded-xl border border-slate-100">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Uploaded On</span>
                    <span className="text-sm font-bold text-slate-700">{formatDate(note.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-slate-50 text-slate-500 p-2.5 rounded-xl border border-slate-100">
                    <Download className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Total Downloads</span>
                    <span className="text-sm font-extrabold text-slate-800">{note.downloads} times</span>
                  </div>
                </div>

              </div>

              <div>
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">Uploader Information</h4>
                <div className="flex items-center space-x-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-ucp-blue to-blue-700 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    {note.uploadedBy ? note.uploadedBy.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() : 'U'}
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-extrabold text-slate-700 truncate" title={note.uploadedBy}>
                      {note.uploadedBy}
                    </div>
                    <div className="text-xs text-slate-400 font-medium truncate" title={note.uploadedByEmail}>
                      {note.uploadedByEmail}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SingleNote;
