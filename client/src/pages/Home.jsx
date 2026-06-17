import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL, SEMESTERS_MAP, OTHERS_FOLDER, getSemesterSubjects } from '../config';
import NoteCard from '../components/NoteCard';
import { Search, BookOpen, GraduationCap, Flame, Clock, UploadCloud, Folder } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [latestNotes, setLatestNotes] = useState([]);
  const [popularNotes, setPopularNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
        // Fetch latest notes (limit 4)
        const latestRes = await fetch(`${API_URL}/api/notes?sort=latest&limit=4`);
        if (!latestRes.ok) throw new Error('Failed to fetch latest notes');
        const latestData = await latestRes.json();
        setLatestNotes(latestData);

        // Fetch most downloaded notes (limit 4)
        const popularRes = await fetch(`${API_URL}/api/notes?sort=downloads&limit=4`);
        if (!popularRes.ok) throw new Error('Failed to fetch popular notes');
        const popularData = await popularRes.json();
        setPopularNotes(popularData.filter(note => note.downloads > 0));

      } catch (err) {
        console.error('Error fetching home page data:', err);
        setError('Could not load notes. Please verify that the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  const handleSemesterClick = (sem) => {
    navigate(`/browse?semester=${sem}`);
  };

  const handleSubjectClick = (sem, sub) => {
    navigate(`/browse?semester=${sem}&subject=${encodeURIComponent(sub)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section with Search Bar */}
      <div className="gradient-bg text-white py-16 px-4 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-ucp-gold/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="bg-white/10 text-ucp-gold font-extrabold text-xs tracking-wider uppercase px-4 py-1.5 rounded-full border border-white/10 inline-block mb-4">
            University Notes Sharing Platform
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Simplify Your Learning Journey
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8 font-medium">
            Access, download, and share past papers and lecture notes uploaded by fellow students. Filtered by semester for quick access.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white rounded-2xl p-2 shadow-xl border border-white/10">
              <div className="flex items-center pl-3 pointer-events-none text-slate-400">
                <Search className="h-6 w-6" />
              </div>
              <input
                type="text"
                placeholder="Search notes by title, subject or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-4 py-3 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-base"
              />
              <button
                type="submit"
                className="bg-ucp-blue text-white hover:bg-ucp-dark font-bold px-6 py-3 rounded-xl transition-all duration-200"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Semester Filters Section */}
        <div className="mb-14">
          <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-ucp-blue" />
            <span>Select Your Semester & Courses</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.keys(SEMESTERS_MAP).map((sem) => (
              <div
                key={sem}
                className="bg-white border border-slate-100 hover:border-ucp-blue hover:shadow-lg p-6 rounded-3xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <h3 className="text-lg font-extrabold text-slate-800">
                      {sem} Semester
                    </h3>
                    <span className="text-[10px] font-extrabold bg-ucp-blue/10 text-ucp-blue px-2.5 py-0.5 rounded-full">
                      {getSemesterSubjects(sem).length} Folders
                    </span>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-2">Subject Courses</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {getSemesterSubjects(sem).map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => handleSubjectClick(sem, sub)}
                        className={`px-2.5 py-1 border text-[10px] font-bold rounded-lg transition-colors ${
                          sub === OTHERS_FOLDER
                            ? 'bg-violet-50 border-violet-200 text-violet-600 hover:bg-violet-600 hover:text-white hover:border-violet-600'
                            : 'bg-slate-50 border-slate-200/50 text-slate-500 hover:bg-ucp-blue hover:text-white hover:border-ucp-blue'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>

                {/* View All Semester Materials */}
                <div className="mt-5 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleSemesterClick(sem)}
                    className="w-full py-2.5 bg-ucp-blue hover:bg-ucp-dark text-white text-center text-xs font-bold rounded-xl transition-all duration-200"
                  >
                    Explore Semester
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-center mb-10">
            <p className="font-semibold">{error}</p>
            <p className="text-xs text-red-500 mt-1">Make sure you have started the backend node server using npm run dev.</p>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-12">
            <div>
              <div className="h-6 w-48 bg-slate-200 rounded-full animate-pulse mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-[280px] bg-slate-200 rounded-2xl animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Latest Notes Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-600" />
                  <span>Recently Uploaded Notes</span>
                </h2>
                <Link to="/browse?sort=latest" className="text-sm font-bold text-ucp-blue hover:underline">
                  View All
                </Link>
              </div>
              
              {latestNotes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                  <p className="text-slate-500 font-medium">No notes available yet.</p>
                  <p className="text-sm text-slate-400 mt-1">Be the first to upload notes for your batch!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {latestNotes.map((note) => (
                    <NoteCard key={note._id} note={note} />
                  ))}
                </div>
              )}
            </div>

            {/* Most Downloaded Notes Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <Flame className="h-5 w-5 text-amber-500" />
                  <span>Most Downloaded Documents</span>
                </h2>
                <Link to="/browse?sort=downloads" className="text-sm font-bold text-ucp-blue hover:underline">
                  View All
                </Link>
              </div>

              {popularNotes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                  <p className="text-slate-500 font-medium">No downloaded notes yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {popularNotes.map((note) => (
                    <NoteCard key={note._id} note={note} />
                  ))}
                </div>
              )}
            </div>

            {/* CTA Upload Section */}
            <div className="gradient-bg rounded-3xl p-8 md:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl text-center md:text-left">
                <h2 className="text-3xl font-extrabold tracking-tight mb-3">
                  Upload & Share Your Notes
                </h2>
                <p className="text-slate-300 font-medium">
                  Help your classmates by sharing your study materials, lecture slides, mid-term prep sheets, and past examination papers. All uploads are instantly available to everyone.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Link
                  to={isAuthenticated ? '/upload' : '/login'}
                  className="flex items-center space-x-2 bg-ucp-gold hover:bg-yellow-400 text-ucp-dark font-extrabold px-8 py-4 rounded-2xl shadow-lg transition-all duration-200 active:scale-95"
                >
                  <UploadCloud className="h-5 w-5" />
                  <span>Upload Study Material</span>
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
