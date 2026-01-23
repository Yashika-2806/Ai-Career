import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Code2, FileText, Brain, Trophy, BookOpen, LogOut, Menu, X, FileUp, Home } from 'lucide-react';
import { useAuthStore } from '../context/auth.store';
import { useState } from 'react';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Code2, label: 'DSA', path: '/dsa' },
    { icon: FileText, label: 'Resume', path: '/resume' },
    { icon: Brain, label: 'Research', path: '/research' },
    { icon: Trophy, label: 'Interview', path: '/interview' },
    { icon: BookOpen, label: 'Roadmap', path: '/roadmap' },
    { icon: FileUp, label: 'PDF Study', path: '/pdf-study' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0f1629]">
      {/* Main Content - Full Width */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
