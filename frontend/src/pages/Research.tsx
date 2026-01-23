import React, { useState, useEffect } from 'react';
import { PlusCircle, BookOpen, Archive, Lightbulb, FileText, GitBranch, Share2, Sparkles, Search, Calendar, TrendingUp, Target, CheckCircle, Brain, HomeIcon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/auth.store';
import { researchService } from '../services/api';

interface ResearchProject {
  _id: string;
  title: string;
  abstract: string;
  problemStatement: string;
  methodology?: string;
  status: 'draft' | 'in-progress' | 'completed';
  relatedWorks?: string[];
  aiSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export const Research: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', abstract: '', problemStatement: '' });
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await researchService.getAll();
      setProjects(data as ResearchProject[]);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newProject.title) return;
    
    setCreating(true);
    try {
      const project = await researchService.create(newProject);
      setProjects([project as ResearchProject, ...projects]);
      setNewProject({ title: '', abstract: '', problemStatement: '' });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateMethodology = async (projectId: string) => {
    try {
      const result = await researchService.generateMethodology(projectId, '') as { methodology: string };
      setProjects(projects.map(p => p._id === projectId ? { ...p, methodology: result.methodology } : p));
      if (selectedProject?._id === projectId) {
        setSelectedProject({ ...selectedProject, methodology: result.methodology });
      }
    } catch (error) {
      console.error('Failed to generate methodology:', error);
    }
  };

  const handleFindRelatedWorks = async (projectId: string) => {
    try {
      const result = await researchService.findRelatedWorks(projectId) as { relatedWorks: string[] };
      setProjects(projects.map(p => p._id === projectId ? { ...p, relatedWorks: result.relatedWorks } : p));
      if (selectedProject?._id === projectId) {
        setSelectedProject({ ...selectedProject, relatedWorks: result.relatedWorks });
      }
    } catch (error) {
      console.error('Failed to find related works:', error);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.problemStatement.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-300';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-300';
      case 'completed': return 'bg-green-500/20 text-green-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">Research Hub</h1>
            <p className="text-[#00d4ff] text-xl">Manage your research projects with AI assistance</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] text-[#0a0e27] font-bold rounded-lg transition text-base btn-primary-glow"
          >
            <PlusCircle className="w-5 h-5" />
            New Project
          </button>
        </div>

        {/* Stats & Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-lg p-6 card-glow">
            <div className="flex items-center gap-3">
              <Target className="w-9 h-9 text-[#00d4ff]" />
              <div>
                <p className="text-3xl font-bold text-white">{projects.length}</p>
                <p className="text-base text-gray-400">Total Projects</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-lg p-6 card-glow">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-9 h-9 text-[#00d4ff]" />
              <div>
                <p className="text-3xl font-bold text-white">{projects.filter(p => p.status === 'in-progress').length}</p>
                <p className="text-base text-gray-400">In Progress</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-lg p-6 card-glow">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-9 h-9 text-[#00d4ff]" />
              <div>
                <p className="text-3xl font-bold text-white">{projects.filter(p => p.status === 'completed').length}</p>
                <p className="text-base text-gray-400">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-lg p-6 card-glow">
            <div className="flex items-center gap-3">
              <Calendar className="w-9 h-9 text-[#00d4ff]" />
              <div>
                <p className="text-2xl font-bold text-white">{projects.filter(p => p.status === 'draft').length}</p>
                <p className="text-sm text-gray-400">Drafts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#00d4ff]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-lg pl-12 pr-4 py-3 text-white text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d4ff] hover-glow-cyan"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:ring-2 focus:ring-[#00d4ff] hover-glow-cyan"
            aria-label="Filter projects by status"
          >
            <option value="all" className="bg-[#0f1629]">All Status</option>
            <option value="draft" className="bg-[#0f1629]">Draft</option>
            <option value="in-progress" className="bg-[#0f1629]">In Progress</option>
            <option value="completed" className="bg-[#0f1629]">Completed</option>
          </select>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading projects...</p>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                onClick={() => setSelectedProject(project)}
                className="bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-lg p-6 hover:border-[#00d4ff]/50 hover:bg-[#1a1f3a] transition cursor-pointer group card-glow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-semibold text-white mb-2 group-hover:text-[#00d4ff] transition break-words">{project.title}</h3>
                    <p className="text-gray-400 text-base line-clamp-2 break-words">{project.problemStatement}</p>
                  </div>
                  <BookOpen className="w-7 h-7 text-[#00d4ff] flex-shrink-0 ml-4" />
                </div>

                <div className="flex items-center gap-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                  {project.methodology && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-400">
                      <Sparkles className="w-3 h-3" />
                      AI Enhanced
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
            <Archive className="w-12 h-12 text-purple-400 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 mb-4">No research projects found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition"
            >
              <PlusCircle className="w-5 h-5" />
              Create Your First Project
            </button>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-900 to-purple-900 border border-white/20 rounded-2xl max-w-2xl w-full p-8 shadow-2xl">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                <PlusCircle className="w-6 h-6" />
                Create New Research Project
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Project Title *</label>
                  <input
                    type="text"
                    placeholder="Enter your research title"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Problem Statement *</label>
                  <textarea
                    placeholder="Describe the problem you're addressing"
                    value={newProject.problemStatement}
                    onChange={(e) => setNewProject({ ...newProject, problemStatement: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Abstract</label>
                  <textarea
                    placeholder="Brief overview of your research"
                    value={newProject.abstract}
                    onChange={(e) => setNewProject({ ...newProject, abstract: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreate}
                    disabled={creating || !newProject.title}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition"
                  >
                    {creating ? 'Creating...' : 'Create Project'}
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="bg-white/5 hover:bg-white/10 text-gray-300 font-semibold py-3 px-6 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Project Detail Modal */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-900 to-purple-900 border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedProject.title}</h2>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProject.status)}`}>
                    {selectedProject.status}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-white transition"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Problem Statement */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    Problem Statement
                  </h3>
                  <p className="text-gray-300">{selectedProject.problemStatement}</p>
                </div>

                {/* Abstract */}
                {selectedProject.abstract && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-400" />
                      Abstract
                    </h3>
                    <p className="text-gray-300">{selectedProject.abstract}</p>
                  </div>
                )}

                {/* AI Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleGenerateMethodology(selectedProject._id)}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition"
                  >
                    <Sparkles className="w-5 h-5" />
                    Generate Methodology
                  </button>
                  <button
                    onClick={() => handleFindRelatedWorks(selectedProject._id)}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition"
                  >
                    <GitBranch className="w-5 h-5" />
                    Find Related Works
                  </button>
                </div>

                {/* Methodology */}
                {selectedProject.methodology && (
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      AI-Generated Methodology
                    </h3>
                    <p className="text-gray-200 whitespace-pre-wrap">{selectedProject.methodology}</p>
                  </div>
                )}

                {/* Related Works */}
                {selectedProject.relatedWorks && selectedProject.relatedWorks.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-cyan-400" />
                      Related Works
                    </h3>
                    <ul className="space-y-2">
                      {selectedProject.relatedWorks.map((work, idx) => (
                        <li key={idx} className="text-gray-300 text-sm">{work}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
