import React, { useState } from 'react';
import { BookOpen, FileUp, Trophy, Code2, Brain, Briefcase, Home as HomeIcon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/auth.store';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const modules = [
    {
      id: 'dsa',
      title: 'DSA Mastery',
      description: 'Master competitive programming with AI feedback',
      icon: Code2,
      stats: { solved: 45, total: 400 },
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'resume',
      title: 'Smart Resume',
      description: 'Auto-build resume from your profiles',
      icon: Briefcase,
      stats: { versions: 3, atsScore: 85 },
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'research',
      title: 'Research Hub',
      description: 'AI-powered research paper writing',
      icon: Brain,
      stats: { projects: 2, papers: 0 },
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'interview',
      title: 'Interview Prep',
      description: 'Mock interviews with AI feedback',
      icon: Trophy,
      stats: { interviews: 5, score: 8.2 },
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'roadmap',
      title: 'Roadmap',
      description: 'Personalized 3/6/12 month roadmap',
      icon: BookOpen,
      stats: { active: 1, progress: 35 },
      color: 'from-indigo-500 to-purple-500',
    },
    {
      id: 'pdf-study',
      title: 'PDF Study',
      description: 'AI-powered PDF learning assistant',
      icon: FileUp,
      stats: { documents: 0 },
      color: 'from-cyan-500 to-blue-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0f1629] p-6 relative">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e27]/95 backdrop-blur-md border-b border-[#00d4ff]/30 shadow-[0_0_20px_rgba(0,212,255,0.1)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] rounded-lg flex items-center justify-center glow-cyan">
              <Brain className="w-6 h-6 text-[#0a0e27]" />
            </div>
            <span className="font-bold text-white text-2xl">Career AI</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a1f3a] hover:bg-[#1a1f3a]/80 border border-[#00d4ff]/30 rounded-lg text-white transition hover-glow-cyan"
            >
              <HomeIcon className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 pt-20">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">Welcome Back!</h1>
          <p className="text-[#00d4ff] text-xl">Your AI-powered career companion is ready</p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => navigate(`/${module.id}`)}
                className="group relative bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-lg p-6 hover:border-[#00d4ff]/50 transition transform hover:scale-105 text-left card-glow hover-glow-cyan"
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br from-[#00d4ff]/10 to-[#0ea5e9]/10 opacity-0 group-hover:opacity-100 rounded-lg transition`} />

                <div className="relative z-10">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] text-[#0a0e27] mb-4 glow-cyan`}>
                    <Icon className="w-8 h-8" />
                  </div>

                  <h3 className="text-2xl font-semibold text-white mb-2">{module.title}</h3>
                  <p className="text-gray-300 text-base mb-4">{module.description}</p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(module.stats).map(([key, value]) => (
                      <div key={key} className="px-3 py-1 bg-[#0f1629] border border-[#00d4ff]/20 rounded-full text-sm text-gray-300">
                        <span className="font-semibold text-[#00d4ff]">{value}</span>
                        {' '}{key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </div>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* AI Mentor Preview */}
        <div className="mt-12 bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-lg p-8 card-glow">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] rounded-full flex items-center justify-center glow-cyan">
              <Brain className="w-7 h-7 text-[#0a0e27]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">AI Mentor Ready</h3>
              <p className="text-gray-300 text-base">Ask me anything about your career journey - I'm here to guide you!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
