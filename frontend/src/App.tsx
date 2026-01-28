import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './context/auth.store';
import { LoginPage } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { DSA } from './pages/DSA';
import { Resume } from './pages/Resume';
import { Research } from './pages/Research';
import { Interview } from './pages/Interview';
import { Roadmap } from './pages/Roadmap';
import { PDFStudy } from './pages/PDFStudy';
import Layout from './components/Layout';

function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setToken = useAuthStore((s) => s.setToken);

  useEffect(() => {
    // Check for token in URL IMMEDIATELY (Google OAuth)
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      // Clean URL without losing state
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    checkAuth();
  }, [checkAuth, setToken]);

  return (
    <Router>
      <Routes>
        {/* Always allow login page */}
        <Route path="/login" element={<LoginPage />} />

        {isAuthenticated ? (
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dsa" element={<DSA />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/research" element={<Research />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/pdf-study" element={<PDFStudy />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        ) : (
          /* If not authenticated, any other route goes to login */
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
