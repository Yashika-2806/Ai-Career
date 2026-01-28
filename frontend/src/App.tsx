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

  useEffect(() => {
    // Check for token in URL (Google OAuth)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      useAuthStore.getState().setToken(token);
      // Clean URL
      window.history.replaceState({}, document.title, "/");
    }

    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Routes>
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
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
