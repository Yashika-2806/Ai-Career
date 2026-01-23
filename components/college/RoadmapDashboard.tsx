import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  TrendingUp, 
  Calendar,
  Award,
  Target,
  Zap,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface RoadmapSummary {
  _id: string;
  role: string;
  duration: number;
  progress: number;
  milestones: {
    completed: number;
    total: number;
  };
  nextMilestone?: {
    week: number;
    title: string;
  };
  weeksRemaining: number;
}

interface RoadmapDashboardProps {
  onNavigateToRoadmap?: () => void;
}

export const RoadmapDashboard: React.FC<RoadmapDashboardProps> = ({ onNavigateToRoadmap }) => {
  const [roadmaps, setRoadmaps] = useState<RoadmapSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRoadmap, setActiveRoadmap] = useState<RoadmapSummary | null>(null);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration - replace with actual API call
      const mockData: RoadmapSummary[] = [
        {
          _id: '1',
          role: 'sde',
          duration: 6,
          progress: 45,
          milestones: { completed: 9, total: 20 },
          nextMilestone: { week: 10, title: 'Advanced DSA - Trees & Graphs' },
          weeksRemaining: 12
        }
      ];
      setRoadmaps(mockData);
      if (mockData.length > 0) {
        setActiveRoadmap(mockData[0]);
      }
    } catch (error) {
      console.error('Failed to fetch roadmap summary:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded w-1/3 mb-4"></div>
          <div className="h-24 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (roadmaps.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 text-center">
        <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Active Roadmap</h3>
        <p className="text-gray-400 mb-6">Start your career journey with a personalized roadmap</p>
        <button
          onClick={onNavigateToRoadmap}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition inline-flex items-center gap-2"
        >
          <Zap className="w-5 h-5" />
          Create Your Roadmap
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Roadmap Card */}
      {activeRoadmap && (
        <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-md border border-indigo-500/30 rounded-xl p-8 shadow-xl">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{getRoleIcon(activeRoadmap.role)}</span>
              <div>
                <h2 className="text-2xl font-bold text-white">{getRoleTitle(activeRoadmap.role)}</h2>
                <p className="text-indigo-200 text-sm flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  {activeRoadmap.duration} Month Journey
                </p>
              </div>
            </div>
            <div className="px-4 py-2 bg-white/10 rounded-full">
              <span className="text-2xl font-bold text-white">{Math.round(activeRoadmap.progress)}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-indigo-200">Overall Progress</span>
              <span className="text-sm text-indigo-300">
                {activeRoadmap.milestones.completed} / {activeRoadmap.milestones.total} milestones
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 via-indigo-400 to-purple-400 h-3 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${activeRoadmap.progress}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{activeRoadmap.milestones.completed}</div>
              <div className="text-xs text-gray-300">Completed</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{activeRoadmap.weeksRemaining}</div>
              <div className="text-xs text-gray-300">Weeks Left</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <Target className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {activeRoadmap.milestones.total - activeRoadmap.milestones.completed}
              </div>
              <div className="text-xs text-gray-300">Remaining</div>
            </div>
          </div>

          {/* Next Milestone */}
          {activeRoadmap.nextMilestone && (
            <div className="bg-white/10 border border-white/20 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-bold rounded">
                  NEXT UP
                </div>
                <span className="text-sm text-gray-300">Week {activeRoadmap.nextMilestone.week}</span>
              </div>
              <h4 className="text-white font-semibold text-lg">{activeRoadmap.nextMilestone.title}</h4>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={onNavigateToRoadmap}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
          >
            View Full Roadmap
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h3 className="text-white font-semibold">This Week</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">3</div>
          <p className="text-gray-400 text-sm">Milestones to complete</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-6 h-6 text-yellow-400" />
            <h3 className="text-white font-semibold">Streak</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">7</div>
          <p className="text-gray-400 text-sm">Days active</p>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-purple-300" />
          <h3 className="text-white font-semibold">AI Recommendation</h3>
        </div>
        <p className="text-gray-200 mb-4">
          You're making great progress! Consider focusing on system design topics this week to strengthen your backend skills.
        </p>
        <button className="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 rounded-lg transition text-sm font-medium">
          Adapt My Roadmap
        </button>
      </div>
    </div>
  );
};
