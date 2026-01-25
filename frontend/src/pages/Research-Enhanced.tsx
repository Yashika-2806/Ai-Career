import React, { useState, useEffect } from 'react';
import { PlusCircle, BookOpen, Archive, Lightbulb, FileText, GitBranch, Share2, Sparkles, Search, Calendar, TrendingUp, Target, CheckCircle, Brain, HomeIcon, LogOut, Trash2, Download, Edit, FileCheck, FileQuestion, BookMarked } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/auth.store';
import { researchService } from '../services/api';

interface ResearchProject {
  _id: string;
  title: string;
  abstract: string;
  problemStatement: string;
  methodology?: string;
  status: 'draft' | 'in-progress' | 'completed' | 'submitted' | 'published';
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
  const [generatingContent, setGeneratingContent] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<{
    literatureReview?: string;
    introduction?: string;
  }>({});

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
    if (!newProject.title || !newProject.problemStatement) return;
    
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

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await researchService.delete(projectId);
      setProjects(projects.filter(p => p._id !== projectId));
      if (selectedProject?._id === projectId) {
        setSelectedProject(null);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleStatusUpdate = async (projectId: string, newStatus: string) => {
    try {
      const updated = await researchService.updateStatus(projectId, newStatus);
      setProjects(projects.map(p => p._id === projectId ? updated as ResearchProject : p));
      if (selectedProject?._id === projectId) {
        setSelectedProject(updated as ResearchProject);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleGenerateMethodology = async (projectId: string) => {
    setGeneratingContent('methodology');
    try {
      const result = await researchService.generateMethodology(projectId, '') as { methodology: string };
      setProjects(projects.map(p => p._id === projectId ? { ...p, methodology: result.methodology } : p));
      if (selectedProject?._id === projectId) {
        setSelectedProject({ ...selectedProject, methodology: result.methodology });
      }
    } catch (error) {
      console.error('Failed to generate methodology:', error);
    } finally {
      setGeneratingContent(null);
    }
  };

  const handleFindRelatedWorks = async (projectId: string) => {
    setGeneratingContent('relatedWorks');
    try {
      const result = await researchService.findRelatedWorks(projectId) as { relatedWorks: string[] };
      setProjects(projects.map(p => p._id === projectId ? { ...p, relatedWorks: result.relatedWorks } : p));
      if (selectedProject?._id === projectId) {
        setSelectedProject({ ...selectedProject, relatedWorks: result.relatedWorks });
      }
    } catch (error) {
      console.error('Failed to find related works:', error);
    } finally {
      setGeneratingContent(null);
    }
  };

  const handleGenerateLiteratureReview = async (projectId: string) => {
    setGeneratingContent('literatureReview');
    try {
      const result = await researchService.generateLiteratureReview(projectId) as { literatureReview: string };
      setGeneratedContent({ ...generatedContent, literatureReview: result.literatureReview });
    } catch (error) {
      console.error('Failed to generate literature review:', error);
    } finally {
      setGeneratingContent(null);
    }
  };

  const handleGenerateAbstract = async (projectId: string) => {
    setGeneratingContent('abstract');
    try {
      const result = await researchService.generateAbstract(projectId) as { abstract: string };
      setProjects(projects.map(p => p._id === projectId ? { ...p, abstract: result.abstract } : p));
      if (selectedProject?._id === projectId) {
        setSelectedProject({ ...selectedProject, abstract: result.abstract });
      }
    } catch (error) {
      console.error('Failed to generate abstract:', error);
    } finally {
      setGeneratingContent(null);
    }
  };

  const handleGenerateIntroduction = async (projectId: string) => {
    setGeneratingContent('introduction');
    try {
      const result = await researchService.generateIntroduction(projectId) as { introduction: string };
      setGeneratedContent({ ...generatedContent, introduction: result.introduction });
    } catch (error) {
      console.error('Failed to generate introduction:', error);
    } finally {
      setGeneratingContent(null);
    }
  };

  const handleExport = async (projectId: string, format: string) => {
    try {
      const result = await researchService.export(projectId, format) as { export: string; format: string };
      // Create a downloadable file
      const blob = new Blob([result.export], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `research_${format}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export:', error);
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
      case 'draft': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'submitted': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'published': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
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
            <p className="text-[#00d4ff] text-xl">AI-Powered Research Paper Writing Assistant</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-lg p-6 card-glow">
            <div className="flex items-center gap-3">
              <Target className="w-9 h-9 text-[#00d4ff]" />
              <div>
                <p className="text-3xl font-bold text-white">{projects.length}</p>
                <p className="text-base text-gray-400">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-yellow-500/30 rounded-lg p-6 card-glow">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-9 h-9 text-yellow-400" />
              <div>
                <p className="text-3xl font-bold text-white">{projects.filter(p => p.status === 'in-progress').length}</p>
                <p className="text-base text-gray-400">In Progress</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-green-500/30 rounded-lg p-6 card-glow">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-9 h-9 text-green-400" />
              <div>
                <p className="text-3xl font-bold text-white">{projects.filter(p => p.status === 'completed').length}</p>
                <p className="text-base text-gray-400">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-blue-500/30 rounded-lg p-6 card-glow">
            <div className="flex items-center gap-3">
              <FileCheck className="w-9 h-9 text-blue-400" />
              <div>
                <p className="text-3xl font-bold text-white">{projects.filter(p => p.status === 'submitted').length}</p>
                <p className="text-base text-gray-400">Submitted</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-purple-500/30 rounded-lg p-6 card-glow">
            <div className="flex items-center gap-3">
              <Calendar className="w-9 h-9 text-purple-400" />
              <div>
                <p className="text-3xl font-bold text-white">{projects.filter(p => p.status === 'draft').length}</p>
                <p className="text-base text-gray-400">Drafts</p>
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
            <option value="submitted" className="bg-[#0f1629]">Submitted</option>
            <option value="published" className="bg-[#0f1629]">Published</option>
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
                className="bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-lg p-6 hover:border-[#00d4ff]/50 hover:bg-[#1a1f3a] transition group card-glow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedProject(project)}>
                    <h3 className="text-2xl font-semibold text-white mb-2 group-hover:text-[#00d4ff] transition break-words">{project.title}</h3>
                    <p className="text-gray-400 text-base line-clamp-2 break-words">{project.problemStatement}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="p-2 bg-[#00d4ff]/20 hover:bg-[#00d4ff]/30 border border-[#00d4ff]/30 rounded-lg text-[#00d4ff] transition"
                      title="View Details"
                    >
                      <BookOpen className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition"
                      title="Delete Project"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`inline-block px-3 py-1 border rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                  {project.methodology && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-400">
                      <Sparkles className="w-3 h-3" />
                      Has Methodology
                    </span>
                  )}
                  {project.relatedWorks && project.relatedWorks.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-400">
                      <GitBranch className="w-3 h-3" />
                      {project.relatedWorks.length} Related Works
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] text-[#0a0e27] font-bold rounded-lg transition"
            >
              <PlusCircle className="w-5 h-5" />
              Create Your First Project
            </button>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-[#1a1f3a] to-[#0f1629] border border-[#00d4ff]/30 rounded-2xl max-w-2xl w-full p-8 shadow-2xl">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-[#00d4ff]" />
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
                    className="w-full px-4 py-3 bg-[#0a0e27]/50 border border-[#00d4ff]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Problem Statement *</label>
                  <textarea
                    placeholder="Describe the problem you're addressing"
                    value={newProject.problemStatement}
                    onChange={(e) => setNewProject({ ...newProject, problemStatement: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#0a0e27]/50 border border-[#00d4ff]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Abstract (Optional)</label>
                  <textarea
                    placeholder="Brief overview of your research (can be generated later with AI)"
                    value={newProject.abstract}
                    onChange={(e) => setNewProject({ ...newProject, abstract: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 bg-[#0a0e27]/50 border border-[#00d4ff]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreate}
                    disabled={creating || !newProject.title || !newProject.problemStatement}
                    className="flex-1 bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0e27] font-bold py-3 px-6 rounded-lg transition"
                  >
                    {creating ? 'Creating...' : 'Create Project'}
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="bg-[#0a0e27]/50 hover:bg-[#0a0e27] border border-[#00d4ff]/30 text-gray-300 font-semibold py-3 px-6 rounded-lg transition"
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gradient-to-br from-[#1a1f3a] to-[#0f1629] border border-[#00d4ff]/30 rounded-2xl max-w-5xl w-full my-8 p-8 shadow-2xl">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-3">{selectedProject.title}</h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    <select
                      value={selectedProject.status}
                      onChange={(e) => handleStatusUpdate(selectedProject._id, e.target.value)}
                      className={`px-3 py-1 border rounded-full text-xs font-medium cursor-pointer ${getStatusColor(selectedProject.status)}`}
                    >
                      <option value="draft">Draft</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="submitted">Submitted</option>
                      <option value="published">Published</option>
                    </select>
                    <span className="text-xs text-gray-400">
                      Created: {new Date(selectedProject.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-400">
                      Updated: {new Date(selectedProject.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    setGeneratedContent({});
                  }}
                  className="text-gray-400 hover:text-white text-2xl transition ml-4"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Problem Statement */}
                <div className="bg-[#0a0e27]/50 border border-[#00d4ff]/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#00d4ff]" />
                    Problem Statement
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{selectedProject.problemStatement}</p>
                </div>

                {/* Abstract */}
                <div className="bg-[#0a0e27]/50 border border-purple-500/20 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-400" />
                      Abstract
                    </h3>
                    <button
                      onClick={() => handleGenerateAbstract(selectedProject._id)}
                      disabled={generatingContent === 'abstract'}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-purple-300 text-sm transition disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      {generatingContent === 'abstract' ? 'Generating...' : 'AI Generate'}
                    </button>
                  </div>
                  {selectedProject.abstract ? (
                    <p className="text-gray-300 leading-relaxed">{selectedProject.abstract}</p>
                  ) : (
                    <p className="text-gray-500 italic">No abstract yet. Use AI to generate one!</p>
                  )}
                </div>

                {/* AI Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleGenerateMethodology(selectedProject._id)}
                    disabled={generatingContent === 'methodology'}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-semibold rounded-lg transition"
                  >
                    <Lightbulb className="w-5 h-5" />
                    {generatingContent === 'methodology' ? 'Generating...' : 'Generate Methodology'}
                  </button>
                  <button
                    onClick={() => handleFindRelatedWorks(selectedProject._id)}
                    disabled={generatingContent === 'relatedWorks'}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white font-semibold rounded-lg transition"
                  >
                    <GitBranch className="w-5 h-5" />
                    {generatingContent === 'relatedWorks' ? 'Finding...' : 'Find Related Works'}
                  </button>
                  <button
                    onClick={() => handleGenerateLiteratureReview(selectedProject._id)}
                    disabled={generatingContent === 'literatureReview'}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg transition"
                  >
                    <BookMarked className="w-5 h-5" />
                    {generatingContent === 'literatureReview' ? 'Generating...' : 'Literature Review'}
                  </button>
                  <button
                    onClick={() => handleGenerateIntroduction(selectedProject._id)}
                    disabled={generatingContent === 'introduction'}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 text-white font-semibold rounded-lg transition"
                  >
                    <FileQuestion className="w-5 h-5" />
                    {generatingContent === 'introduction' ? 'Generating...' : 'Generate Introduction'}
                  </button>
                  <button
                    onClick={() => handleExport(selectedProject._id, 'ieee')}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition"
                  >
                    <Download className="w-5 h-5" />
                    Export IEEE
                  </button>
                  <button
                    onClick={() => handleExport(selectedProject._id, 'bibtex')}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition"
                  >
                    <Download className="w-5 h-5" />
                    Export BibTeX
                  </button>
                </div>

                {/* Methodology */}
                {selectedProject.methodology && (
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      AI-Generated Methodology
                    </h3>
                    <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">{selectedProject.methodology}</div>
                  </div>
                )}

                {/* Related Works */}
                {selectedProject.relatedWorks && selectedProject.relatedWorks.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-cyan-400" />
                      Related Works
                    </h3>
                    <ul className="space-y-3">
                      {selectedProject.relatedWorks.map((work, idx) => (
                        <li key={idx} className="text-gray-300 text-sm pl-4 border-l-2 border-cyan-500/30">{work}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Literature Review */}
                {generatedContent.literatureReview && (
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <BookMarked className="w-5 h-5 text-emerald-400" />
                      Literature Review
                    </h3>
                    <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">{generatedContent.literatureReview}</div>
                  </div>
                )}

                {/* Introduction */}
                {generatedContent.introduction && (
                  <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <FileQuestion className="w-5 h-5 text-orange-400" />
                      Introduction Section
                    </h3>
                    <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">{generatedContent.introduction}</div>
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
