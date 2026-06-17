import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Upload from './pages/Upload';
import SingleNote from './pages/SingleNote';
import Login from './pages/Login';
import Register from './pages/Register';
import Pricing from './pages/Pricing';
import PricingSection from './components/PricingSection';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { APP_NAME, GOOGLE_CLIENT_ID } from './config';
import { GraduationCap, Heart } from 'lucide-react';

const AppLayout = () => {
  const location = useLocation();
  const isAdminLoginPage = location.pathname === '/admin/login';
  const isPricingPage = location.pathname === '/pricing';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isDashboardPage = location.pathname === '/dashboard';
  const showPricingSection = !isAdminLoginPage && !isPricingPage && !isAuthPage && !isDashboardPage;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {!isAdminLoginPage && <Navbar />}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/notes/:id" element={<SingleNote />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {showPricingSection && <PricingSection showHeader={false} />}

      {!isAdminLoginPage && (
        <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-white">
                <GraduationCap className="h-6 w-6 text-ucp-gold" />
                <span className="font-extrabold text-xl tracking-tight text-white">
                  {APP_NAME}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                The central notes sharing library for university students. Browse, download, and share study materials by semester.
              </p>
            </div>

            <div>
              <h3 className="text-white font-extrabold text-sm uppercase tracking-wider mb-4">Quick Navigation</h3>
              <ul className="space-y-2 text-sm font-semibold">
                <li>
                  <a href="/" className="hover:text-white transition-colors">Home Page</a>
                </li>
                <li>
                  <a href="/browse" className="hover:text-white transition-colors">Browse Notes</a>
                </li>
                <li>
                  <a href="/upload" className="hover:text-white transition-colors">Upload Material</a>
                </li>
                <li>
                  <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
                </li>
              </ul>
            </div>

            {/* About the Author Card */}
            <div className="bg-slate-800/40 border border-slate-800/80 rounded-2xl p-4 flex gap-4 items-center">
              <img 
                src="https://github.com/AbubakarTechy.png" 
                alt="Author Profile" 
                className="w-14 h-14 rounded-full border border-slate-700 object-cover flex-shrink-0" 
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80";
                }}
              />
              <div className="space-y-1">
                <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">About the Author</h4>
                <p className="text-[11px] text-slate-400 font-medium leading-normal">
                  Designed and built with passion. Check out my profiles below:
                </p>
                <div className="flex gap-3 text-xs font-bold text-ucp-gold pt-0.5">
                  <a href="https://linkedin.com/in/abubakartechy" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-yellow-400">LinkedIn</a>
                  <a href="https://github.com/AbubakarTechy" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-yellow-400">GitHub</a>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-500">
              <p>
                <span className="font-bold text-slate-400">Disclaimer:</span> This is a student-led collaborative community project and may not be officially affiliated with your university.
              </p>
              <div className="flex items-center space-x-1 border-t border-slate-800 pt-4 font-bold text-[10px]">
                <span>Made with</span>
                <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
                <span>for students</span>
              </div>
            </div>

          </div>

          <div className="max-w-7xl mx-auto border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
            <p className="mt-2 sm:mt-0 font-medium">Share knowledge. Learn together.</p>
          </div>
        </footer>
      )}
    </div>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  const appContent = (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <ScrollToTop />
          <AppLayout />
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );

  if (!GOOGLE_CLIENT_ID) {
    return appContent;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {appContent}
    </GoogleOAuthProvider>
  );
}

export default App;
