import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  CheckCircle, 
  Target, 
  Calendar,
  BookOpen,
  ExternalLink,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  Award,
  RefreshCw,
  Info,
  Zap,
  Trash2,
  Check,
  Brain,
  Home as HomeIcon,
  LogOut
} from 'lucide-react';
import { roadmapService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/auth.store';

// Helper function to extract meaningful names from URLs
const getResourceName = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    const path = urlObj.pathname;
    
    // Mapping for popular sites
    const nameMap: Record<string, string> = {
      'leetcode.com': 'LeetCode',
      'youtube.com': 'YouTube',
      'youtu.be': 'YouTube',
      'github.com': 'GitHub',
      'stackoverflow.com': 'Stack Overflow',
      'geeksforgeeks.org': 'GeeksforGeeks',
      'coursera.org': 'Coursera',
      'udemy.com': 'Udemy',
      'edx.org': 'edX',
      'khanacademy.org': 'Khan Academy',
      'medium.com': 'Medium',
      'dev.to': 'DEV Community',
      'freecodecamp.org': 'freeCodeCamp',
      'codecademy.com': 'Codecademy',
      'hackerrank.com': 'HackerRank',
      'codeforces.com': 'Codeforces',
      'codechef.com': 'CodeChef',
      'topcoder.com': 'TopCoder',
      'kaggle.com': 'Kaggle',
      'neetcode.io': 'NeetCode',
      'takeuforward.org': 'TakeUForward',
      'visualgo.net': 'VisuAlgo',
      'brilliant.org': 'Brilliant',
      'programiz.com': 'Programiz',
      'w3schools.com': 'W3Schools',
      'tutorialspoint.com': 'TutorialsPoint',
      'javatpoint.com': 'JavaTPoint',
      'scaler.com': 'Scaler',
      'interviewbit.com': 'InterviewBit',
      'algoexpert.io': 'AlgoExpert',
      'educative.io': 'Educative',
      'frontendmentor.io': 'Frontend Mentor',
      'codepen.io': 'CodePen',
      'replit.com': 'Replit',
      'codesandbox.io': 'CodeSandbox',
      'nodejs.org': 'Node.js Docs',
      'reactjs.org': 'React Docs',
      'react.dev': 'React Docs',
      'vuejs.org': 'Vue.js Docs',
      'angular.io': 'Angular Docs',
      'python.org': 'Python Docs',
      'docs.python.org': 'Python Docs',
      'numpy.org': 'NumPy',
      'pandas.pydata.org': 'Pandas',
      'scikit-learn.org': 'Scikit-Learn',
      'tensorflow.org': 'TensorFlow',
      'pytorch.org': 'PyTorch',
      'mozilla.org': 'MDN Web Docs',
      'css-tricks.com': 'CSS-Tricks',
      'smashingmagazine.com': 'Smashing Magazine',
      'stackoverflow.blog': 'Stack Overflow Blog',
      'martinfowler.com': 'Martin Fowler',
      'blog.cleancoder.com': 'Clean Coder',
      'refactoring.guru': 'Refactoring Guru',
      'patterns.dev': 'Patterns.dev',
      'web.dev': 'web.dev',
      'roadmap.sh': 'Roadmap.sh',
      'cses.fi': 'CSES',
      'usaco.org': 'USACO',
      'cp-algorithms.com': 'CP-Algorithms',
      'atcoder.jp': 'AtCoder',
      'spoj.com': 'SPOJ',
      'projecteuler.net': 'Project Euler',
      'adventofcode.com': 'Advent of Code',
    };
    
    // Check if we have a mapping for this domain
    for (const [domain, name] of Object.entries(nameMap)) {
      if (hostname.includes(domain)) {
        return name;
      }
    }
    
    // Extract from path if it contains useful info
    if (path.includes('tag/')) {
      const tag = path.split('tag/')[1]?.split('/')[0];
      if (tag) return `${nameMap[hostname] || hostname} - ${tag}`;
    }
    
    // Fallback to cleaned hostname
    return hostname
      .split('.')[0]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } catch {
    return 'Resource Link';
  }
};

interface Milestone {
  week: number;
  title: string;
  description: string;
  resources: string[];
  completed: boolean;
}

interface RoadmapData {
  _id: string;
  role: string;
  duration: number;
  milestones: Milestone[];
  progress: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export const Roadmap: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [roadmaps, setRoadmaps] = useState<RoadmapData[]>([]);
  const [newRoadmap, setNewRoadmap] = useState({ 
    role: 'sde', 
    duration: 6, 
    currentLevel: 'beginner',
    goals: '',
    topicKnowledge: {
      dsa: 'beginner',
      systemDesign: 'beginner',
      projects: 'beginner',
      interviews: 'beginner'
    },
    availableHoursPerDay: 2,
    preferredLearningStyle: 'balanced',
    hasDeadline: false,
    deadlineDate: ''
  });
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedRoadmaps, setExpandedRoadmaps] = useState<Set<string>>(new Set());
  const [deletingRoadmap, setDeletingRoadmap] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const loadRoadmaps = async () => {
      if (!mounted) return;
      await fetchRoadmaps();
    };
    
    loadRoadmaps();
    
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - only run once

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await roadmapService.get() as any;
      // Backend returns array directly, not wrapped in data
      const roadmapsData = Array.isArray(response) ? response : (response.data || []);
      
      // WHY: Remove duplicates by _id to prevent React key warnings
      const uniqueRoadmaps = roadmapsData.filter((roadmap: any, index: number, self: any[]) => 
        index === self.findIndex((r: any) => r._id === roadmap._id)
      );
      
      setRoadmaps(uniqueRoadmaps);
    } catch (error: any) {
      console.error('Failed to fetch roadmaps:', error);
      setError('Failed to load roadmaps. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!newRoadmap.goals.trim()) {
      setError('Please enter your career goals');
      return;
    }

    setGenerating(true);
    setError(null);
    try {
      const roadmap = await roadmapService.generate(newRoadmap) as RoadmapData;
      console.log('Generated roadmap:', roadmap);
      setRoadmaps([roadmap, ...roadmaps]);
      setNewRoadmap({ 
        role: 'sde', 
        duration: 6, 
        currentLevel: 'beginner',
        goals: '',
        topicKnowledge: {
          dsa: 'beginner',
          systemDesign: 'beginner',
          projects: 'beginner',
          interviews: 'beginner'
        },
        availableHoursPerDay: 2,
        preferredLearningStyle: 'balanced',
        hasDeadline: false,
        deadlineDate: ''
      });
      setExpandedRoadmaps(new Set([roadmap._id]));
      setShowAdvancedOptions(false);
    } catch (error: any) {
      console.error('Failed to generate roadmap:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.details 
        || error.message 
        || 'Failed to generate roadmap. Please try again.';
      
      setError(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleMilestone = async (roadmapId: string, weekNumber: number, completed: boolean) => {
    try {
      const updatedRoadmap = await roadmapService.updateMilestone({
        roadmapId,
        weekNumber,
        completed: !completed
      }) as RoadmapData;
      
      // WHY: Replace roadmap in array instead of mutating
      // Ensures React re-renders correctly
      setRoadmaps(roadmaps.map((r: RoadmapData) => 
        r._id === roadmapId ? updatedRoadmap : r
      ));
    } catch (error) {
      console.error('Failed to update milestone:', error);
      setError('Failed to update milestone. Please try again.');
    }
  };

  const handleDeleteRoadmap = async (roadmapId: string, roadmapRole: string) => {
    // WHY: Confirm before deleting to prevent accidental deletion
    if (!window.confirm(`Are you sure you want to delete the ${roadmapRole} roadmap?`)) {
      return;
    }

    setDeletingRoadmap(roadmapId);
    setError(null);

    try {
      console.log(`🗑️ Deleting roadmap: ${roadmapId}`);
      await roadmapService.delete(roadmapId);
      
      // Remove from state
      setRoadmaps(prev => prev.filter(r => r._id !== roadmapId));
      
      // Remove from expanded set
      setExpandedRoadmaps(prev => {
        const newSet = new Set(prev);
        newSet.delete(roadmapId);
        return newSet;
      });
      
      console.log('✅ Roadmap deleted successfully');
    } catch (error: any) {
      console.error('❌ Failed to delete roadmap:', error);
      
      if (error.response) {
        setError(error.response.data?.error || 'Failed to delete roadmap.');
      } else {
        setError('Failed to delete roadmap. Please try again.');
      }
    } finally {
      setDeletingRoadmap(null);
    }
  };

  const toggleRoadmapExpansion = (roadmapId: string) => {
    const newExpanded = new Set(expandedRoadmaps);
    if (newExpanded.has(roadmapId)) {
      newExpanded.delete(roadmapId);
    } else {
      newExpanded.add(roadmapId);
    }
    setExpandedRoadmaps(newExpanded);
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, string> = {
      'sde': '💻',
      'aiml-engineer': '🤖',
      'researcher': '🔬',
      'data-scientist': '📊'
    };
    return icons[role] || '🎯';
  };

  const getRoleTitle = (role: string) => {
    const titles: Record<string, string> = {
      'sde': 'Software Engineer',
      'aiml-engineer': 'AI/ML Engineer',
      'researcher': 'Researcher',
      'data-scientist': 'Data Scientist'
    };
    return titles[role] || role;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getWeeksRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks > 0 ? diffWeeks : 0;
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-12 h-12 text-[#00d4ff] glow-cyan" />
            <h1 className="text-5xl font-bold text-white">Career Roadmap</h1>
          </div>
          <p className="text-gray-300 text-xl">AI-powered personalized career path planning</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Info className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-200 font-medium">Error</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-200 hover:text-white transition"
            >
              ×
            </button>
          </div>
        )}

        {/* Generate New Roadmap */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <div>
                <h2 className="text-2xl font-semibold text-white">Generate Your Personalized Roadmap</h2>
                <p className="text-sm text-gray-400 mt-1">Get week-by-week guidance with topics, tasks, and resources - just like ChatGPT!</p>
              </div>
            </div>
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="text-indigo-300 hover:text-indigo-200 text-sm flex items-center gap-2"
            >
              {showAdvancedOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
            </button>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Award className="w-4 h-4 inline mr-2" />
                Target Role *
              </label>
              <select
                value={newRoadmap.role}
                onChange={(e) => setNewRoadmap({ ...newRoadmap, role: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 transition cursor-pointer [color-scheme:dark]"
                aria-label="Select target role"
              >
                <option value="sde" className="bg-gray-800 text-white">💻 Software Engineer (SDE)</option>
                <option value="aiml-engineer" className="bg-gray-800 text-white">🤖 AI/ML Engineer</option>
                <option value="researcher" className="bg-gray-800 text-white">🔬 Research Scientist</option>
                <option value="data-scientist" className="bg-gray-800 text-white">📊 Data Scientist</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Duration *
              </label>
              <select
                value={newRoadmap.duration}
                onChange={(e) => setNewRoadmap({ ...newRoadmap, duration: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 transition cursor-pointer [color-scheme:dark]"
                aria-label="Select roadmap duration"
              >
                <option value={3} className="bg-gray-800 text-white">3 Months (Intensive)</option>
                <option value={6} className="bg-gray-800 text-white">6 Months (Balanced)</option>
                <option value={12} className="bg-gray-800 text-white">12 Months (Comprehensive)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Target className="w-4 h-4 inline mr-2" />
                Career Goals *
              </label>
              <textarea
                rows={3}
                value={newRoadmap.goals}
                onChange={(e) => setNewRoadmap({ ...newRoadmap, goals: e.target.value })}
                placeholder="E.g., Get placed at FAANG companies, Build strong DSA foundation, Create ML portfolio with 3 projects, Clear system design rounds..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 transition resize-none"
              />
            </div>
          </div>

          {/* Advanced Options */}
          {showAdvancedOptions && (
            <div className="border-t border-white/10 pt-6 mb-6 space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">📊 Skill Assessment</h3>
              
              {/* Skill Levels Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    DSA Knowledge Level
                  </label>
                  <select
                    value={newRoadmap.topicKnowledge.dsa}
                    onChange={(e) => setNewRoadmap({ 
                      ...newRoadmap, 
                      topicKnowledge: { ...newRoadmap.topicKnowledge, dsa: e.target.value }
                    })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-400 transition cursor-pointer [color-scheme:dark]"
                    aria-label="Select DSA knowledge level"
                  >
                    <option value="beginner" className="bg-gray-800 text-white">Beginner - Just starting</option>
                    <option value="intermediate" className="bg-gray-800 text-white">Intermediate - Basics clear</option>
                    <option value="advanced" className="bg-gray-800 text-white">Advanced - Can solve hard problems</option>
                    <option value="expert" className="bg-gray-800 text-white">Expert - Interview ready</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    System Design Knowledge
                  </label>
                  <select
                    value={newRoadmap.topicKnowledge.systemDesign}
                    onChange={(e) => setNewRoadmap({ 
                      ...newRoadmap, 
                      topicKnowledge: { ...newRoadmap.topicKnowledge, systemDesign: e.target.value }
                    })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-400 transition cursor-pointer [color-scheme:dark]"
                    aria-label="Select system design knowledge level"
                  >
                    <option value="beginner" className="bg-gray-800 text-white">Beginner - No experience</option>
                    <option value="intermediate" className="bg-gray-800 text-white">Intermediate - Basic concepts</option>
                    <option value="advanced" className="bg-gray-800 text-white">Advanced - Can design systems</option>
                    <option value="expert" className="bg-gray-800 text-white">Expert - Production experience</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Experience
                  </label>
                  <select
                    value={newRoadmap.topicKnowledge.projects}
                    onChange={(e) => setNewRoadmap({ 
                      ...newRoadmap, 
                      topicKnowledge: { ...newRoadmap.topicKnowledge, projects: e.target.value }
                    })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-400 transition cursor-pointer [color-scheme:dark]"
                    aria-label="Select project experience level"
                  >
                    <option value="beginner" className="bg-gray-800 text-white">Beginner - 0-1 projects</option>
                    <option value="intermediate" className="bg-gray-800 text-white">Intermediate - 2-3 projects</option>
                    <option value="advanced" className="bg-gray-800 text-white">Advanced - 4+ projects</option>
                    <option value="expert" className="bg-gray-800 text-white">Expert - Open source contributor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Interview Preparation
                  </label>
                  <select
                    value={newRoadmap.topicKnowledge.interviews}
                    onChange={(e) => setNewRoadmap({ 
                      ...newRoadmap, 
                      topicKnowledge: { ...newRoadmap.topicKnowledge, interviews: e.target.value }
                    })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-400 transition cursor-pointer [color-scheme:dark]"
                    aria-label="Select interview preparation level"
                  >
                    <option value="beginner" className="bg-gray-800 text-white">Beginner - Never appeared</option>
                    <option value="intermediate" className="bg-gray-800 text-white">Intermediate - Few attempts</option>
                    <option value="advanced" className="bg-gray-800 text-white">Advanced - Multiple rounds cleared</option>
                    <option value="expert" className="bg-gray-800 text-white">Expert - Offers received</option>
                  </select>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-4 mt-6">⏰ Time & Schedule</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Available Hours Per Day
                  </label>
                  <select
                    value={newRoadmap.availableHoursPerDay}
                    onChange={(e) => setNewRoadmap({ ...newRoadmap, availableHoursPerDay: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-400 transition cursor-pointer [color-scheme:dark]"
                    aria-label="Select available hours per day"
                  >
                    <option value={1} className="bg-gray-800 text-white">1 hour/day (Very light)</option>
                    <option value={2} className="bg-gray-800 text-white">2 hours/day (Light)</option>
                    <option value={3} className="bg-gray-800 text-white">3 hours/day (Moderate)</option>
                    <option value={4} className="bg-gray-800 text-white">4 hours/day (Intensive)</option>
                    <option value={6} className="bg-gray-800 text-white">6+ hours/day (Full-time)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Learning Style Preference
                  </label>
                  <select
                    value={newRoadmap.preferredLearningStyle}
                    onChange={(e) => setNewRoadmap({ ...newRoadmap, preferredLearningStyle: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-400 transition cursor-pointer [color-scheme:dark]"
                    aria-label="Select learning style preference"
                  >
                    <option value="theory" className="bg-gray-800 text-white">Theory-focused (Learn then practice)</option>
                    <option value="practical" className="bg-gray-800 text-white">Practical-focused (Learn by doing)</option>
                    <option value="balanced" className="bg-gray-800 text-white">Balanced (Mix of both)</option>
                    <option value="project" className="bg-gray-800 text-white">Project-based (Build while learning)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={newRoadmap.hasDeadline}
                      onChange={(e) => setNewRoadmap({ ...newRoadmap, hasDeadline: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 bg-white/10 border-white/20 rounded focus:ring-indigo-500"
                      aria-label="I have a specific deadline"
                      title="I have a specific deadline"
                    />
                    <label className="text-sm font-medium text-gray-300">
                      I have a specific deadline (e.g., placement drive, interview date)
                    </label>
                  </div>
                  
                  {newRoadmap.hasDeadline && (
                    <input
                      type="date"
                      value={newRoadmap.deadlineDate}
                      onChange={(e) => setNewRoadmap({ ...newRoadmap, deadlineDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-400 transition"
                      aria-label="Select deadline date"
                      title="Select your target deadline date"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating || !newRoadmap.goals.trim()}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition shadow-lg hover:shadow-indigo-500/50 flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating AI Roadmap...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Generate Personalized Roadmap
              </>
            )}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
            <span className="ml-3 text-gray-300 text-lg">Loading roadmaps...</span>
          </div>
        )}

        {/* No Roadmaps */}
        {!loading && roadmaps.length === 0 && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Roadmaps Yet</h3>
            <p className="text-gray-400 mb-6">Create your first personalized career roadmap to get started!</p>
          </div>
        )}

        {/* Roadmaps List */}
        <div className="space-y-6">
          {roadmaps.map((roadmap) => {
            const isExpanded = expandedRoadmaps.has(roadmap._id);
            const completedMilestones = roadmap.milestones.filter(m => m.completed).length;
            const weeksRemaining = getWeeksRemaining(roadmap.endDate);

            return (
              <div key={roadmap._id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-xl hover:border-white/30 transition">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{getRoleIcon(roadmap.role)}</span>
                      <h3 className="text-3xl font-bold text-white">{getRoleTitle(roadmap.role)}</h3>
                      <span className="px-3 py-1 bg-indigo-500/30 text-indigo-200 text-sm font-medium rounded-full">
                        {roadmap.duration} Months
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Started {formatDate(roadmap.startDate)}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {weeksRemaining} weeks remaining
                      </span>
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        {completedMilestones}/{roadmap.milestones.length} completed
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteRoadmap(roadmap._id, getRoleTitle(roadmap.role))}
                    disabled={deletingRoadmap === roadmap._id}
                    className="px-3 py-2 bg-red-600/30 hover:bg-red-600/50 text-red-200 rounded-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete roadmap"
                  >
                    {deletingRoadmap === roadmap._id ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </>
                    )}
                  </button>
              </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-300">Overall Progress</span>
                    <span className="text-lg font-bold text-indigo-400">{Math.round(roadmap.progress)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                    {/* eslint-disable-next-line */}
                    <div
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${Math.round(roadmap.progress)}%` }}
                      role="progressbar"
                      aria-label="Roadmap overall progress"
                      aria-valuenow={Math.round(roadmap.progress)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>

                {/* Milestones */}
                <div className="space-y-3">
                  {(isExpanded ? roadmap.milestones : roadmap.milestones.slice(0, 4)).map((milestone) => (
                    <div
                      key={`${roadmap._id}-week-${milestone.week}`}
                      className={`p-5 rounded-lg border transition-all ${
                        milestone.completed
                          ? 'bg-green-500/10 border-green-500/30 shadow-lg shadow-green-500/10'
                          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => handleToggleMilestone(roadmap._id, milestone.week, milestone.completed)}
                          className={`flex-shrink-0 mt-1 transition-all hover:scale-110 ${
                            milestone.completed ? 'animate-pulse' : ''
                          }`}
                          title={milestone.completed ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          {milestone.completed ? (
                            <div className="relative">
                              <CheckCircle className="w-7 h-7 text-green-400" />
                              <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                            </div>
                          ) : (
                            <div className="relative group">
                              <Target className="w-7 h-7 text-gray-400 group-hover:text-indigo-400 transition" />
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                                Click to complete
                              </div>
                            </div>
                          )}
                        </button>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 text-xs font-bold rounded ${
                              milestone.completed 
                                ? 'bg-green-500/20 text-green-300' 
                                : 'bg-indigo-500/20 text-indigo-300'
                            }`}>
                              {milestone.completed ? '✓ ' : ''}WEEK {milestone.week}
                            </span>
                            <h4 className={`font-semibold text-lg ${
                              milestone.completed ? 'text-green-400' : 'text-white'
                            }`}>
                              {milestone.title}
                            </h4>
                          </div>
                          
                          <p className={`mb-3 ${
                            milestone.completed ? 'text-gray-400 line-through' : 'text-gray-300'
                          }`}>
                            {milestone.description}
                          </p>
                          
                          {milestone.resources && milestone.resources.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs text-gray-400 font-medium">📚 Learning Resources:</p>
                              <div className="flex flex-wrap gap-2">
                                {milestone.resources.map((resource, idx) => (
                                  <a
                                    key={`${roadmap._id}-week-${milestone.week}-resource-${idx}`}
                                    href={resource}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-indigo-200 text-xs font-medium rounded-lg transition-all hover:scale-105 border border-indigo-500/20"
                                  >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    {getResourceName(resource)}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Expand/Collapse Button */}
                {roadmap.milestones.length > 4 && (
                  <button
                    onClick={() => toggleRoadmapExpansion(roadmap._id)}
                    className="w-full mt-4 px-4 py-3 text-indigo-400 hover:text-indigo-300 hover:bg-white/5 font-medium rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-5 h-5" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-5 h-5" />
                        View All {roadmap.milestones.length} Milestones
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
